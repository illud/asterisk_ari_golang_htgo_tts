package makecall

import (
	"context"
	"os"
	"time"

	"golang.org/x/exp/slog"

	espeak "golang_asterisk/espeak"

	"github.com/CyCoreSystems/ari/v6"
	"github.com/CyCoreSystems/ari/v6/client/native"
	"github.com/CyCoreSystems/ari/v6/ext/play"
)

var log = slog.New(slog.NewTextHandler(os.Stderr, nil))

func MakeCall(phoneNumber string, text string) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	log.Info("Connecting to ARI")

	// Use ari.Client (interface type) and let the ARI client handle the connection
	cl, err := native.Connect(&native.Options{
		Application:  "example",
		Username:     "golang_app",
		Password:     "supersecret",
		URL:          "http://asterisk:8088/ari",      // Ensure this URL is correct for your Asterisk setup in docker else use localhost
		WebsocketURL: "ws://asterisk:8088/ari/events", // Ensure this URL is correct for your Asterisk setup in docker else use localhost
	})
	if err != nil {
		log.Error("Failed to build ARI client", "error", err)
		return
	}

	log.Info("Listening for new calls")

	// Call extension 1000 directly
	callToExtension(ctx, cl, phoneNumber, text)

	// Wait for termination
	if _, ok := <-ctx.Done(); ok {
		log.Info("Terminating application")
	}
}

func callToExtension(ctx context.Context, cl ari.Client, extension string, text string) {
	log.Info("Dialing extension", "extension", extension)

	// Generate a unique key for the channel
	//key := ari.NewKey("channel", "12345") // Here you can use any string value for unique identification

	// Create and originate the call using the correct SIP/1000 format
	channel, err := cl.Channel().Originate(nil, ari.OriginateRequest{
		//Endpoint: "SIP/" + extension + "@trunk-remote", // Ensure the endpoint uses "SIP/1000" (check your config if using PJSIP)
		Endpoint: "PJSIP/" + extension, // Ensure the endpoint uses "SIP/1000" (check your config if using PJSIP)
		App:      "example",            // The name of your ARI application
	})

	if err != nil {
		log.Error("Failed to originate call", "error", err)
		return
	}

	log.Info("Call initiated to extension", "channel", channel.ID())

	// Wait for the call to be answered by the client
	// Subscribe to channel state change events
	stateChangeEvents := channel.Subscribe(ari.Events.ChannelStateChange)
	defer stateChangeEvents.Cancel()

	log.Info("Waiting for the client to answer...")

	// Listen for state changes until the state is "Up" (answered)
	timeout := time.After(20 * time.Second)
	for {
		select {
		case event := <-stateChangeEvents.Events():
			if stateChange, ok := event.(*ari.ChannelStateChange); ok {
				log.Info("Channel state changed", "state", stateChange.Channel.State)

				switch stateChange.Channel.State {
				case "Up":
					log.Info("Call has been answered by the client")

					err := espeak.GenerateSpeech(text, "./asterisk-sounds/hello.ulaw")
					if err != nil {
						log.Error("Failed to generate speech", "error", err)
						return
					}

					if err := play.Play(ctx, channel, play.URI("sound:hello")).Err(); err != nil {
						log.Error("Failed to play sound", "error", err)
						return
					}

					waitForNameInput(ctx, channel)
					log.Info("hanging up call after name confirmation")
					return

				case "Busy", "Failed", "Hungup", "Decline":
					log.Warn("Call not answered or was declined, stopping...")
					return
				}
			}

		case <-timeout:
			if err := channel.Hangup(); err != nil {
				log.Error("failed to hang up call", "error", err)
			}
			log.Warn("Call not answered in 20 seconds, hanging up...")
			return

		case <-ctx.Done():
			log.Info("Context canceled, stopping call monitoring")
			return
		}
	}
}
func waitForNameInput(ctx context.Context, channel *ari.ChannelHandle) {
	// Listen for DTMF events again for name confirmation
	dtmfEvents := channel.Subscribe(ari.Events.ChannelDtmfReceived)
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
					log.Info("User pressed 1")
					// Handle the case when '1' is pressed
					// if err := play.Play(ctx, channel, play.URI("sound:goodbye")).Err(); err != nil {
					// 	log.Error("failed to play sound", "error", err)
					// 	return
					// }
					// After playing the sound, hang up the call
					if err := channel.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}
					log.Info("hanging up call after name confirmation")
					return
				case "2":
					log.Info("No, the client did not confirm")
					// if err := play.Play(ctx, channel, play.URI("sound:goodbye")).Err(); err != nil {
					// 	log.Error("failed to play sound", "error", err)
					// 	return
					// }
					// After playing the sound, hang up the call
					if err := channel.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}
					log.Info("hanging up call after name confirmation")
					return
				default:
					log.Info("User pressed an invalid key during name confirmation")
					// After playing the sound, hang up the call
					if err := channel.Hangup(); err != nil {
						log.Error("failed to hang up call", "error", err)
					}
					log.Info("hanging up call after not valid key pressed")
					return
				}
			}

		case <-ctx.Done():
			return
		}
	}
}
