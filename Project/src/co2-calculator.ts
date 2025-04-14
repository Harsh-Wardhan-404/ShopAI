import { co2 } from '@tgwf/co2';

/**
 * Calculate CO2 emissions for a given number of bytes transferred
 * @param totalBytes - The number of bytes transferred
 * @returns The estimated CO2 emissions in grams
 */
export function calculateEmissions(totalBytes: number) {
  // Define custom options for CO2 calculation
  const options = {
    gridIntensity: {
      dataCenter: { country: "USA" }, // Assuming data center is in the US
    }
  };

  // Instantiate the CO2 calculator with options
  const calculator = new co2(options);

  // Calculate emissions
  const emissions = calculator.perByte(totalBytes);

  return emissions;
}
