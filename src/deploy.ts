#!/usr/bin/env node

import Deployer from "./Deployer";
import { readParams } from "./util";

const deploy = () => {
  const params = readParams();

  const deployer = new Deployer(params);

  deployer.start();
};

deploy();
