package models

type FlowWrapper struct {
	PhoneNumber string     `json:"phoneNumber"`
	Language    string     `json:"language"`
	Flow        []FlowStep `json:"flow"`
}
type FlowStep struct {
	ID      int            `json:"id"`
	Type    string         `json:"type"`
	Text    string         `json:"text"`
	Options map[string]int `json:"options,omitempty"`
	Next    *int           `json:"next,omitempty"`
}
