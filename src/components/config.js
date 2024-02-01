// config.js
let config = null;

export const loadConfig = async () => {

        // DEV
        // fetch('http://localhost:3000/config_dev.json')
        // LIVE
        // fetch('/home/dh_8y5iqp/config.json')

        //config = JSON.parse(response);

            try {
              const response = await fetch('http://localhost:3000/config_dev.json');
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              const data = await response.json();
              // Directly update the module-level `config` variable
              config = data;
            } catch (error) {
              console.error('Error fetching JSON:', error);
            }
          };

export const getConfig = (configItem) => {
    return config ? config[configItem] : null;
};
