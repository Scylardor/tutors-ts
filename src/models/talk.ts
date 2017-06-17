import {LearningObject} from './learningobjects';
import * as path from 'path';
const glob = require('glob');
import * as sh from 'shelljs';
import {copyResource} from './loutils';

export class Talk extends LearningObject {
  constructor(parent: LearningObject) {
    super(parent);
    this.icon = 'huge object group';
    this.reap();
    this.lotype = 'talk';
  }

  reap(): void {
    this.link = 'error: missing pdf';
    let resourceList = glob.sync('*.pdf').sort();
    if (resourceList.length > 0) {
      const resourceName = path.parse(resourceList[0]).name;
      super.reap(resourceName);
      this.link = resourceList[0];
    }
  }

  publish(path: string): void {
    copyResource(this.folder, path);
  }
}
