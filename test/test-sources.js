function fetchFile(name) {
  const url = `/base/out/${name}`
  return fetch(url).then(response => response.text())
}

describe('remap source prefixes', () => {
  it('remaps sources in a base64 inline source map', async () => {
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

  it('remaps sources in a raw inline source map', async () => {
    const content = await fetchFile('shared-raw.js')
    expect(content).toBe(`var shared = (function () {
  'use strict';

  function shared() {
    console.log();
  }

  return shared;

})();
//# sourceMappingURL=data:application/json,%7B%22version%22%3A3%2C%22file%22%3A%22shared.js%22%2C%22sources%22%3A%5B%22%2Ftest%2Fshared.js%22%5D%2C%22sourcesContent%22%3A%5B%22export%20default%20function%20shared()%20%7B%5Cn%20%20console.log()%5Cn%7D%5Cn%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22%3B%3B%3BEAAe%2CSAAS%2CMAAM%2CGAAG%3BEACjC%2CEAAE%2COAAO%2CCAAC%2CGAAG%2CGAAE%3BEACf%3B%3B%3B%3B%3B%3B%3B%3B%22%7D
`)
  })

  it('leaves an invalid inline source mapping intact', async () => {
    const code = await fetchFile('shared-invalid.js')
    expect(code).toBe(`var shared = (function () {
  'use strict';

  function shared() {
    console.log();
  }

  return shared;

})();
//# sourceMappingURL=data:application/json;%7B%22version%22%3A3%2C%22file%22%3A%22shared.js%22%2C%22sources%22%3A%5B%22%2Ftest%2Fshared.js%22%5D%2C%22sourcesContent%22%3A%5B%22export%20default%20function%20shared()%20%7B%5Cn%20%20console.log()%5Cn%7D%5Cn%22%5D%2C%22names%22%3A%5B%5D%2C%22mappings%22%3A%22%3B%3B%3BEAAe%2CSAAS%2CMAAM%2CGAAG%3BEACjC%2CEAAE%2COAAO%2CCAAC%2CGAAG%2CGAAE%3BEACf%3B%3B%3B%3B%3B%3B%3B%3B%22%7D
`)
  })

  it('leaves a corrupted inline source map content intact', async () => {
    const code = await fetchFile('shared-corrupted.js')
    expect(code).toBe(`var shared = (function () {
  'use strict';

  function shared() {
    console.log();
  }

  return shared;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,ewo=
`)
  })

  it('leaves a valid external source map reference intact', async () => {
    const code = await fetchFile('bundle.js')
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
//# sourceMappingURL=bundle.js.map
`)
  })

  it('leaves an invalid external source map reference intact', async () => {
    const code = await fetchFile('bundle-missingmap.js')
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
//# sourceMappingURL=bundle.js.map.none
`)
  })

  it('leaves a corrupted external source map content intact', async () => {
    const code = await fetchFile('bundle-corruptedmap.js')
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
//# sourceMappingURL=bundle-corruptedmap.js.map
`)
  })

  it('leaves the code without an external source map reference intact', async () => {
    const code = await fetchFile('bundle-nomapref.js')
    expect(code).toBe(`(function () {
  'use strict';

  function shared() {
    console.log();
  }

  shared();

})();
`)
  })

  it('remaps sources in an external source map', async () => {
    const map = JSON.parse(await fetchFile('bundle.js.map'))
    for (const source of map.sources) {
      expect(source).toContain('../src/');
    }
  })
})
