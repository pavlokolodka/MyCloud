export default class ModuleFactory {
  static createModule = (dependencies: Map<any, Array<any>>) => {
    const createdDependents = [];
    const iterator = dependencies.keys();
    let dependent = iterator.next().value;

    while (dependent !== undefined) {
      const createdDependencies = [];
      const localDependencies = dependencies.get(dependent);

      if (!localDependencies) {
        createdDependencies.push(new dependent());
        dependent = iterator.next().value;
        continue;
      }

      for (let i = 0; i < localDependencies.length; i++) {
        const localDependency = localDependencies[i];

        if (localDependency instanceof Map) {
          const nestedDependencies: Array<any> =
            ModuleFactory.createModule(localDependency);
          createdDependencies.push(...nestedDependencies);
        } else {
          createdDependencies.push(new localDependency());
        }
      }

      createdDependents.push(new dependent(...createdDependencies));
      dependent = iterator.next().value;
    }

    return createdDependents;
  };
}
