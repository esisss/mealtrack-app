export const checkArrayIncludesNewArrayBy = (
	arrayA: any[],
	arrayB: any[],
	prop: string
) => {
	const propsA = new Set(arrayA.map((item) => item[prop]));

	if (propsA.size === 0) {
		return arrayB;
	}
	const missingObjects: any[] = [];
	for (const item of arrayB) {
		if (!propsA.has(item[prop])) {
			missingObjects.push(item);
		}
	}
	return missingObjects;
};
