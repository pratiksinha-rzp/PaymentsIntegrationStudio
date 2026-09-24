package credential

type Credential struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Environment string `json:"environment"`
	KeyID       string `json:"key_id"`
	KeySecret   string `json:"-"`
}