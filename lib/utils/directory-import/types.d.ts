export type ModuleName = string;
export type ModulePath = string;
export type ModuleData = unknown;
export type ModuleIndex = number;

export type ImportModulesMode = 'sync' | 'async';
export type ImportModulesCallback = (name: ModuleName, path: ModulePath, data: ModuleData, index: ModuleIndex) => void;

export type ImportModulesInputArguments = [
  targetDirectoryPathOrOptionsOrCallback?: string | ImportedModulesPublicOptions | ImportModulesCallback,
  modeOrCallback?: ImportModulesMode | ImportModulesCallback,
  callback?: ImportModulesCallback,
];

export interface ImportedModules {
  [key: ModulePath]: ModuleData;
}

export interface ImportedModulesPublicOptions {
  includeSubdirectories?: boolean;
  callerDirectoryPath?: string;
  targetDirectoryPath?: string;
  importPattern?: RegExp;
  importMode?: ImportModulesMode;
  limit?: number;
}

export interface ImportedModulesPrivateOptions extends Required<ImportedModulesPublicOptions> {
  callback?: ImportModulesCallback;

  callerFilePath: string;
  callerDirectoryPath: string;
}
