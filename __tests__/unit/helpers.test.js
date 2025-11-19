const { findCategoryIndex, generateRandomString } = require('../../utils/helpers');

describe('Helper Functions', () => {
    describe('findCategoryIndex', () => {
        const mockCategories = [
            { category_name: 'Electronic' },
            { category_name: 'Rock' },
            { category_name: 'Jazz' }
        ];

        it('should find the correct index for an existing category', () => {
            expect(findCategoryIndex(mockCategories, 'Rock')).toBe(1);
            expect(findCategoryIndex(mockCategories, 'Electronic')).toBe(0);
            expect(findCategoryIndex(mockCategories, 'Jazz')).toBe(2);
        });

        it('should return -1 for a non-existent category', () => {
            expect(findCategoryIndex(mockCategories, 'Classical')).toBe(-1);
            expect(findCategoryIndex(mockCategories, 'Pop')).toBe(-1);
        });

        it('should return -1 for an empty array', () => {
            expect(findCategoryIndex([], 'Electronic')).toBe(-1);
        });

        it('should be case-sensitive', () => {
            expect(findCategoryIndex(mockCategories, 'rock')).toBe(-1);
            expect(findCategoryIndex(mockCategories, 'ELECTRONIC')).toBe(-1);
        });
    });

    describe('generateRandomString', () => {
        it('should generate a string of the specified length', () => {
            expect(generateRandomString(10)).toHaveLength(10);
            expect(generateRandomString(20)).toHaveLength(20);
            expect(generateRandomString(5)).toHaveLength(5);
        });

        it('should generate different strings on consecutive calls', () => {
            const str1 = generateRandomString(20);
            const str2 = generateRandomString(20);
            expect(str1).not.toBe(str2);
        });

        it('should only contain alphanumeric characters', () => {
            const str = generateRandomString(100);
            const alphanumericRegex = /^[a-zA-Z0-9]+$/;
            expect(alphanumericRegex.test(str)).toBe(true);
        });

        it('should handle length of 0', () => {
            expect(generateRandomString(0)).toBe('');
        });

        it('should handle length of 1', () => {
            expect(generateRandomString(1)).toHaveLength(1);
        });
    });
});
