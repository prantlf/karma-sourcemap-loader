function fetchFile(name) {
  const url = `/base/out/${name}`
  return fetch(url).then(response => response.text())
}

describe('set sourceRoot', () => {
  it('sets sourceRoot in an inline source map', async () => {
    const content = await fetchFile('shared.js')
    expect(content).toBe(`var shared = (function () {
  'use strict';

  function shared() {
    console.log();
  }

  return shared;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlcyI6WyIvdGVzdC9zaGFyZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2hhcmVkKCkge1xuICBjb25zb2xlLmxvZygpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQWUsU0FBUyxNQUFNLEdBQUc7RUFDakMsRUFBRSxPQUFPLENBQUMsR0FBRyxHQUFFO0VBQ2Y7Ozs7Ozs7OyJ9
`)
  })

  it('sets sourceRoot in an external source map', async () => {
    const map = JSON.parse(await fetchFile('bundle.js.map'))
    expect(map.sourceRoot).toBe('/sources')
  })
})
