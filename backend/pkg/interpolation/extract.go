package interpolation

import (
	"encoding/json"
	"fmt"
	"strings"
)

func ExtractJSONPath(body []byte, path string) (interface{}, error) {
	var data interface{}

	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	parts := strings.Split(path, ".")

	var current interface{} = data

	for _, part := range parts {
		object, ok := current.(map[string]interface{})
		if !ok {
			return nil, fmt.Errorf("cannot access path: %s", path)
		}

		value, ok := object[part]
		if !ok {
			return nil, fmt.Errorf("field not found: %s", path)
		}

		current = value
	}

	return current, nil
}
