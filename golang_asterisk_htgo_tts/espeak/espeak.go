package espeak

import (
	"fmt"
	"os/exec"

	htgotts "github.com/hegedustibor/htgo-tts"
	"github.com/hegedustibor/htgo-tts/handlers"
	"github.com/hegedustibor/htgo-tts/voices"
)

// GenerateSpeech creates a TTS audio file in .ulaw format using htgo-tts + sox
func GenerateSpeech(text, outputPath string) error {
	// Step 1: Set up the TTS speech configuration
	speech := htgotts.Speech{
		Folder:   "audio",             // Folder to save temporary files
		Language: voices.Spanish,      // Language (can be changed)
		Handler:  &handlers.MPlayer{}, // MPlayer or other handler
	}

	// Step 2: Generate the TTS file with a specified filename (e.g., temp.mp3)
	tempFile := "temp.mp3"
	tempFilePath, err := speech.CreateSpeechFile(text, tempFile)
	if err != nil {
		return fmt.Errorf("htgo-tts failed: %w", err)
	}

	// Step 3: Convert the TTS file to .ulaw using sox
	cmdSox := exec.Command("sox", tempFilePath, "-r", "8000", "-c", "1", "-t", "raw", "-e", "mu-law", outputPath)
	if err := cmdSox.Run(); err != nil {
		return fmt.Errorf("sox conversion failed: %w", err)
	}

	// Step 4: Optional cleanup of temporary .mp3 file
	_ = exec.Command("rm", tempFilePath).Run()

	return nil
}
