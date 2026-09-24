package interpolation

import (
	"encoding/json"
	"fmt"
	"regexp"
)

var variablePattern = regexp.MustCompile(`\{\{([^{}]+)\}\}`)

func ResolveString(input string, variables map[string]interface{}) (string, error) {
	matches := variablePattern.FindAllStringSubmatch(input, -1)

	if len(matches) == 0 {
		return input, nil
	}

	result := input

	for _, match := range matches {
		fullMatch := match[0]
		key := match[1]

		value, ok := variables[key]
		if !ok {
			return "", fmt.Errorf("variable not found: %s", key)
		}

		valueString, err := toString(value)
		if err != nil {
			return "", err
		}

		result = replaceOnce(result, fullMatch, valueString)
	}

	return result, nil
}

func ResolveMap(
	input map[string]interface{},
	variables map[string]interface{},
) (map[string]interface{}, error) {
	output := make(map[string]interface{})

	for key, value := range input {
		resolvedValue, err := resolveValue(value, variables)
		if err != nil {
			return nil, err
		}

		output[key] = resolvedValue
	}

	return output, nil
}

func resolveValue(
	value interface{},
	variables map[string]interface{},
) (interface{}, error) {
	switch v := value.(type) {
	case string:
		return ResolveString(v, variables)

	case map[string]interface{}:
		return ResolveMap(v, variables)

	case []interface{}:
		result := make([]interface{}, len(v))

		for i, item := range v {
			resolvedItem, err := resolveValue(item, variables)
			if err != nil {
				return nil, err
			}

			result[i] = resolvedItem
		}

		return result, nil

	default:
		return value, nil
	}
}

func toString(value interface{}) (string, error) {
	switch v := value.(type) {
	case string:
		return v, nil

	default:
		data, err := json.Marshal(v)
		if err != nil {
			return "", err
		}

		return string(data), nil
	}
}

func replaceOnce(
	input string,
	target string,
	replacement string,
) string {
	result := input

	for {
		next := variablePattern.ReplaceAllStringFunc(
			result,
			func(match string) string {
				if match == target {
					return replacement
				}

				return match
			},
		)

		if next == result {
			return result
		}

		result = next
	}
}
