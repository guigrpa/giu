/* eslint-env jest */
const Floats = jest.genMockFromModule('../floats');

Floats.Floats = mockComponent('Floats');

module.exports = Floats;
