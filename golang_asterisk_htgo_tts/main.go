package main

import (
	"encoding/json"
	"fmt"
	"golang_asterisk/makecallflow"
	models "golang_asterisk/models"
	"io"
	"net/http"
)

func handlePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Optionally parse JSON
	var data models.FlowWrapper
	if err := json.Unmarshal(body, &data); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// // Start the receive call function
	// receivecall.ReceiveCall()

	// // Print a message indicating that the program is running
	// fmt.Println("Running...")

	// Start the make call function
	go makecallflow.MakeCallFlow(data.PhoneNumber, data)

	// Log or respond
	fmt.Printf("Received POST: %+v\n", data)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("POST received"))
}

func main() {
	http.HandleFunc("/call", handlePost)
	fmt.Println("Listening on :5000...")
	http.ListenAndServe(":5000", nil)
}
