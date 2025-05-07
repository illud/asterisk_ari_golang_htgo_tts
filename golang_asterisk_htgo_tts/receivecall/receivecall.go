package receivecall

import (
	"context"
	"os"

	"golang.org/x/exp/slog"

	"github.com/CyCoreSystems/ari/v6"
	"github.com/CyCoreSystems/ari/v6/client/native"
	"github.com/CyCoreSystems/ari/v6/ext/play"
)

var log = slog.New(slog.NewTextHandler(os.Stderr, nil))

func ReceiveCall() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	log.Info("Connecting to ARI")

	cl, err := native.Connect(&native.Options{
		Application:  "example",
		Username:     "golang_app",
		Password:     "supersecret",
		URL:          "http://localhost:8088/ari",
		WebsocketURL: "ws://localhost:8088/ari/events",
	})
	if err != nil {
		log.Error("Failed to build ARI client", "error", err)
		return
	}

	log.Info("Listening for new calls")

	sub := cl.Bus().Subscribe(nil, "StasisStart")

	for {
		select {
		case e := <-sub.Events():
			v := e.(*ari.StasisStart)

			log.Info("Got stasis start", "channel", v.Channel.ID)

			go app(ctx, cl.Channel().Get(v.Key(ari.ChannelKey, v.Channel.ID)))
		case <-ctx.Done():
			return
		}
	}
}

func app(ctx context.Context, h *ari.ChannelHandle) {
	defer h.Hangup() //nolint:errcheck

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	log.Info("Running app", "channel", h.ID())

	end := h.Subscribe(ari.Events.StasisEnd)
	defer end.Cancel()

	// End the app when the channel goes away
	go func() {
		<-end.Events()
		cancel()
	}()

	if err := h.Answer(); err != nil {
		log.Error("failed to answer call", "error", err)
		return
	}

	if err := play.Play(ctx, h, play.URI("sound:hello")).Err(); err != nil {
		log.Error("failed to play sound", "error", err)
		return
	}
	log.Info("completed playback: hello")

	if err := play.Play(ctx, h, play.URI("sound:youaccept")).Err(); err != nil {
		log.Error("failed to play sound", "error", err)
		return
	}
	log.Info("completed playback: preguntacliente")

	// Listen for DTMF events
	dtmfEvents := h.Subscribe(ari.Events.ChannelDtmfReceived)
	defer dtmfEvents.Cancel()

	log.Info("Waiting for user input...")

	for {
		select {
		case input := <-dtmfEvents.Events():
			// Check if we have a valid DTMF event
			if dtmf, ok := input.(*ari.ChannelDtmfReceived); ok {
				log.Info("User pressed:", "digit", dtmf.Digit)

				// Handle the input
				switch dtmf.Digit {
				case "1":
					log.Info("User pressed 1")
					// Handle the case when '1' is pressed
					if err := play.Play(ctx, h, play.URI("sound:goodbye")).Err(); err != nil {
						log.Error("failed to play sound", "error", err)
						return
					}

					// Listen for the next input
					log.Info("Waiting for user input... for name confirmation")
					waitForNameInput(ctx, h)

				case "2":
					log.Info("User pressed 2")
					// Handle the case when '2' is pressed
					return
				default:
					log.Info("User pressed an invalid key")
					return
				}
			}

		case <-ctx.Done():
			return
		}
	}
}

func waitForNameInput(ctx context.Context, h *ari.ChannelHandle) {
	// Listen for DTMF events again for name confirmation
	dtmfEvents := h.Subscribe(ari.Events.ChannelDtmfReceived)
	defer dtmfEvents.Cancel()

	for {
		select {
		case input := <-dtmfEvents.Events():
			if dtmf, ok := input.(*ari.ChannelDtmfReceived); ok {
				log.Info("User pressed:", "digit", dtmf.Digit)

				switch dtmf.Digit {
				case "1":
					log.Info("Yes, the client confirmed")
					// Process yes input
					// Handle the case when '1' is pressed
					if err := play.Play(ctx, h, play.URI("sound:goodbye")).Err(); err != nil {
						log.Error("failed to play sound", "error", err)
						return
					}

					// After playing the sound, hang up the call
					if err := h.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}

					return
				case "2":
					log.Info("User pressed 2 (No confirmation)")
					// Handle No confirmation logic
					// After playing the sound, hang up the call
					if err := h.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}

					return
				default:
					log.Info("User pressed an invalid key during name confirmation")
					// After playing the sound, hang up the call
					if err := h.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}

					return
				}
			}

		case <-ctx.Done():
			return
		}
	}
}
