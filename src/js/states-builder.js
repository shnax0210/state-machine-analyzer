const selectionsTypes = {
    ANY_OF: "ANY_OF",
    ANY_COMBINATION_OF: "ANY_COMBINATION_OF"
}

function buildAttributePath(currentPath, attributeName) {
    if (currentPath) {
        return currentPath + "." + attributeName;
    }
    return attributeName;
}

function buildAttributePaths(object, currentPath = "", result = []) {
    Object.keys(object).forEach(attributeName => {
        let attributePath = buildAttributePath(currentPath, attributeName);

        result.push(attributePath);
        if (object[attributeName].objects) {
            buildAttributePaths(object[attributeName].objects, attributePath, result);
        }
    })

    return result;
}

function maxAttributePathsDeep(attributePaths) {
    return Math.max.apply(null, attributePaths.map(path => path.split(".").length));
}

function findAttributeWithDeep(attributePaths, attributeDeep) {
    return attributePaths.filter(path => path.split(".").length === attributeDeep);
}

function buildPrecessingOrder(attributePaths) {
    let attributeDeep = maxAttributePathsDeep(attributePaths)
    const result = [];

    while (attributeDeep > 0) {
        let attributesWithParticularDeep = findAttributeWithDeep(attributePaths, attributeDeep)
        if (attributesWithParticularDeep) {
            result.push(attributesWithParticularDeep)
        }
        --attributeDeep;
    }

    return result;
}

function findAttributeDescription(attributePath, statesDescription) {
    let result = statesDescription;

    attributePath.split(".")
        .forEach(pathElement => {
            if (!result.objects) {
                result = result[pathElement]
            } else {
                result = result.objects[pathElement]
            }
        });

    return result;
}

function convertAllArraysToSets(object) {
    if (Array.isArray(object)) {
        return new Set(object.map(element => convertAllArraysToSets(element)))
    }

    if (object && typeof object === "object") {
        const result = {};

        Object.entries(object).forEach(keyToValue => {
            result[keyToValue[0]] = convertAllArraysToSets(keyToValue[1]);
        })

        return result;
    }

    return object;
}

function findAllCombinations(list) {
    let set = [[]],
        listSize = list.length,
        combinationsCount = (1 << listSize),
        combination;

    for (let i = 1; i < combinationsCount; i++) {
        combination = [];
        for (let j = 0; j < listSize; j++) {
            if ((i & (1 << j))) {
                combination.push(list[j]);
            }
        }
        set.push(combination);
    }
    return set;
}

function cartesianProduct(arr) {
    return arr.reduce(function (a, b) {
        return a.map(function (x) {
            return b.map(function (y) {
                return x.concat([y]);
            })
        }).reduce(function (a, b) {
            return a.concat(b)
        }, [])
    }, [[]])
}

function buildAttributeValueObject(attributesStore, attributePath, subAttributeName) {
    return attributesStore[buildAttributePath(attributePath, subAttributeName)]
        .map(attributeValue => {
            return {
                name: subAttributeName,
                value: attributeValue
            }
        })
}

function buildAttributesValueObjects(attributeDescription, attributesStore, attributePath) {
    return Object.keys(attributeDescription.objects)
        .map(subAttributeName => buildAttributeValueObject(attributesStore, attributePath, subAttributeName));
}

function createObject(attributesCombination) {
    const result = {};
    attributesCombination.forEach(attribute => result[attribute.name] = attribute.value);
    return result;
}

function findUniqAttributes(attributeDescription) {
    return Object.entries(attributeDescription.objects)
        .filter(entry => entry[1].unique)
        .map(entry => entry[0]);
}

function hasDuplicatedUniqAttributes(combination, uniqAttribute) {
    return (new Set(combination.map(element => element[uniqAttribute]))).size !== combination.length;
}

function isValidCombination(combination, attributeDescription) {
    return !findUniqAttributes(attributeDescription)
        .find(uniqAttribute => hasDuplicatedUniqAttributes(combination, uniqAttribute))
}

function processAttribute(attributePath, attributesStore, statesDescription) {
    const attributeDescription = findAttributeDescription(attributePath, statesDescription);

    if (attributeDescription.values) {
        if (attributeDescription.selectionType === selectionsTypes.ANY_OF) {
            attributesStore[attributePath] = attributeDescription.values;
            return;
        }

        if (attributeDescription.selectionType === selectionsTypes.ANY_COMBINATION_OF) {
            attributesStore[attributePath] = findAllCombinations(attributeDescription.values);
            return;
        }

        throw "Not knows selectionType=" + attributeDescription.selectionType;
    }

    if (attributeDescription.objects) {
        const values = cartesianProduct(buildAttributesValueObjects(attributeDescription, attributesStore, attributePath))
            .map(attributesCombination => createObject(attributesCombination));

        if (attributeDescription.selectionType === selectionsTypes.ANY_OF) {
            attributesStore[attributePath] = values;
            return;
        }

        if (attributeDescription.selectionType === selectionsTypes.ANY_COMBINATION_OF) {
            attributesStore[attributePath] = findAllCombinations(values)
                .filter(combination => isValidCombination(combination, attributeDescription));
            return;
        }

        throw "Not known selectionType=" + attributeDescription.selectionType;
    }

    throw "Not known attributeDescription=" + attributeDescription;
}

function buildStates(statesDescription) {
    statesDescription = {
        states: {
            selectionType: selectionsTypes.ANY_OF,
            objects: statesDescription
        }
    }

    const attributesSetToProcess = buildPrecessingOrder(buildAttributePaths(statesDescription));
    const attributesStore = {};

    attributesSetToProcess
        .forEach(attributes => attributes
            .forEach(attributePath => processAttribute(attributePath, attributesStore, statesDescription)))

    return attributesStore.states.map(state => {return {
        stateObject: convertAllArraysToSets(state)
    }});
}

exports.buildStates = buildStates;
exports.selectionsTypes = selectionsTypes;
