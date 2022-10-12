export function getInputAsNumber(input: string | null | undefined) {
	if (input == null) {
		return null;
	}

	const value = parseInt(input, 10);

	if (Number.isNaN(value)) {
		return null;
	}

	// Shaun Boley 2020 Special Edition
	// https://twitter.com/IanMitchel1/status/1311817185212293120
	if (!Number.isSafeInteger(value)) {
		return null;
	}

	return value;
}
