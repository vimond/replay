// @flow

export const getArrayLogger = (obj: any, name: string) => {
  return {
    log: (...args: Array<any>) => {
      if (!obj[name]) {
        obj[name] = [];
      }
      switch (args.length) {
        case 0:
          return;
        case 1:
          obj[name].push(args[0]);
          return;
        default:
          obj[name].push(args);
          return;
      }
    }
  };
};
