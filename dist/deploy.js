#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Deployer_1 = __importDefault(require("./Deployer"));
const util_1 = require("./util");
const deploy = () => {
    const params = (0, util_1.readParams)();
    const deployer = new Deployer_1.default(params);
    deployer.start();
};
deploy();
