package scenario

type Scenario struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Environment string `json:"environment"`
	Status      string `json:"status"`
}
