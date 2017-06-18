import { CompositeLearningObject, LearningObject } from './learningobjects';
import { Book } from './book'
import { Topic } from './topic';
import { findLos, publishLos, publishTemplate, reapLos } from './loutils';
import { copyFileToFolder, getCurrentDirectory } from '../utils/futils';
import * as fs from 'fs';
import { CommandOptions } from '../controllers/commands';
import { Git } from './git';
import { Video } from './video';
import {Talk} from './discrete-learningobject';

export class Course extends CompositeLearningObject {
  labs: Book[] = [];
  talks: Talk[] = [];
  repos: Git[] = [];
  videos: Video[] = [];
  options: CommandOptions;
  resources: LearningObject[];

  insertCourseRef(los: Array<LearningObject>): void {
    los.forEach(lo => {
      lo.course = this;
      if (lo instanceof Topic) {
        this.insertCourseRef(lo.los);
      }
    });
  }

  getIgnoreList(): string[] {
    const ignoreList: string[] = [];
    if (fs.existsSync('mbignore')) {
      const array = fs.readFileSync('mbignore').toString().split('\n');
      for (let i = 0; i < array.length; i++) {
        ignoreList[i] = array[i].trim();
      }
    }
    return ignoreList;
  }

  constructor(options?: CommandOptions, parent?: LearningObject) {
    super(parent);
    if (options) {
      this.options = options;
    }
    this.los = reapLos(this);
    this.lotype = 'course';
    this.icon = 'huge book';
    this.reap('course');
    const ignoreList = this.getIgnoreList();
    this.los = this.los.filter(lo => ignoreList.indexOf(lo.folder) < 0);

    this.labs = findLos(this.los, 'lab') as Book[];
    this.talks = findLos(this.los, 'talk') as Talk[];
    this.repos = findLos(this.los, 'git') as Git[];
    this.videos = findLos(this.los, 'video') as Video[];

    this.insertCourseRef(this.los);
  }

  publish(path: string): void {
    console.log(':: ', this.title);
    if (path.charAt(0) !== '/' && path.charAt(1) !== ':') {
      path = getCurrentDirectory() + '/' + path;
    }
    publishTemplate(path, 'index.html', 'course.njk', this);
    copyFileToFolder(this.img, path);
    publishLos(path, this.los);
    this.talks.forEach(talk => {
      if (talk.parent === this) {
        talk.parentFolder = './';
      }
    });
    this.resources = this.labs;
    publishTemplate(path, '/labwall.html', 'wall.njk', this);
    this.resources = this.talks;
    publishTemplate(path, '/talkwall.html', 'wall.njk', this);
    this.resources = this.videos;
    publishTemplate(path, '/videowall.html', 'wall.njk', this);
    this.resources = this.repos;
    publishTemplate(path, '/repowall.html', 'wall.njk', this);
  }
}
