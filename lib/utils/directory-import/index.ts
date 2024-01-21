import importModules from './import-modules';
import preparePrivateOptions from './prepare-private-options';
import {
  ImportedModules,
  ImportedModulesPublicOptions,
  ImportModulesCallback,
  ImportModulesInputArguments,
  ImportModulesMode,
} from './types.d';

/**
 * Import modules from the current directory synchronously
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(): ImportedModules;

/**
 * Import modules from the current directory synchronously and call the provided callback for each imported module.
 * @param {ImportModulesCallback} callback - The callback function to call for each imported module.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(callback: ImportModulesCallback): ImportedModules;

/**
 * Import modules from the specified directory synchronously.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(targetDirectoryPath: string): ImportedModules;

/**
 * Import all modules from the specified directory synchronously and call the provided callback for each imported module.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @param {ImportModulesCallback} callback - The callback function to call for each imported module.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(targetDirectoryPath: string, callback: ImportModulesCallback): ImportedModules;

/**
 * Import all modules from the specified directory synchronously or asynchronously.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @param {ImportModulesMode} mode - The import mode. Can be 'sync' or 'async'.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(targetDirectoryPath: string, mode: ImportModulesMode): ImportedModules;

/**
 * Import all modules from the specified directory synchronously or asynchronously and call the provided callback for each imported module.
 * @param {string} targetDirectoryPath - The path to the directory to import modules from.
 * @param {ImportModulesMode} importMode - The import mode. Can be 'sync' or 'async'.
 * @param {ImportModulesCallback} callback - The callback function to call for each imported module.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(
  targetDirectoryPath: string,
  importMode: ImportModulesMode,
  callback: ImportModulesCallback,
): ImportedModules;

/**
 * Import all modules from the specified directory
 * @param {ImportedModulesPublicOptions} options - The options object.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(options: ImportedModulesPublicOptions): ImportedModules;

/**
 * Import all modules from the specified directory and call the provided callback for each imported module.
 * @param {ImportedModulesPublicOptions} options - The options object.
 * @param {ImportModulesCallback} callback - The callback function to call for each imported module.
 * @returns {ImportedModules} An object containing all imported modules.
 */
function directoryImport(options: ImportedModulesPublicOptions, callback: ImportModulesCallback): ImportedModules;

/**
 * Import all modules from the specified directory with the given options and call the provided callback for each imported module.
 * @param {ImportModulesInputArguments} arguments_ - The arguments.
 * @returns {ImportedModules|Promise<ImportedModules>} An object containing all imported modules.
 */
function directoryImport(...arguments_: ImportModulesInputArguments): ImportedModules | Promise<ImportedModules> {
  const options = preparePrivateOptions(...arguments_);

  try {
    return importModules(options);
  } catch (error) {
    Object.assign(error as Error, options);

    throw error;
  }
}

export { directoryImport };
