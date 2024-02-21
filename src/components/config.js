// config.js
let config = null;

export const loadConfig = async () => {

            try {
             const response = await fetch('/.config/config.json');
              
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
