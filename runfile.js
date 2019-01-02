const { run } = require('runjs')

const isWindows = process.platform == 'win32'; // even 64-bit uses win32

function configure(environment) {
  try {
    if (isWindows) {
      run('more config.yaml')
    } else {
      run('cat config.yaml');
    }
    console.log("WARNING: 'config.yaml' exists - skipping the configure step")
  } catch(e) {
    if (!environment) {
      environment = 'localhost';
    }
    console.log('ENVIRONMENT:' + environment);
    if (isWindows) {
      run(`copy server\\config\\${environment}.config.yaml .\\config.yaml`)
    } else {
      run(`cp server/config/${environment}.config.yaml ./config.yaml`)
    }
    console.log('./config.yaml was successfully created');
  }
}

module.exports = {
    configure
}
