// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import * as assert from "assert";
import { WebResource } from "../lib/webResource";
import { MsRestUserAgentFilter } from "../lib/filters/msRestUserAgentFilter";
import { Constants } from "../lib/util/constants";

const should = require("should");
const userAgentHeader = Constants.HeaderConstants.USER_AGENT;

describe("ms-rest user agent filter", () => {

  it("should construct user agent header when supplied empty array", (done) => {
    const userAgentArray: Array<string> = [];
    const userAgentFilter = new MsRestUserAgentFilter(userAgentArray);
    const resource = new WebResource();
    resource.headers = {};
    userAgentFilter.before(resource).then((resource) => {
      should.ok(resource);
      resource.headers[userAgentHeader].should.containEql("Node");
      resource.headers[userAgentHeader].should.containEql("Azure-SDK-For-Node");
      done();
    }).catch((err) => { done(err); });
  });

  it("should not modify user agent header if already present", (done) => {
    const genericRuntime = "ms-rest";
    const azureRuntime = "ms-rest-azure";
    const azureSDK = "Azure-SDK-For-Node";
    const userAgentArray = [`${genericRuntime}/v1.0.0`, `${azureRuntime}/v1.0.0`];
    const userAgentFilter = new MsRestUserAgentFilter(userAgentArray);
    const customUA = "my custom user agent";
    const resource = new WebResource();
    resource.headers = {};
    resource.headers[userAgentHeader] = customUA;
    userAgentFilter.before(resource).then((resource) => {
      should.ok(resource);
      const actualUA = resource.headers[userAgentHeader];
      actualUA.should.not.containEql("Node");
      actualUA.should.not.containEql(azureSDK);
      actualUA.should.not.containEql(azureRuntime);
      actualUA.should.containEql(customUA);
      done();
    }).catch((err) => { done(err); });
  });

  it("should insert azure-sdk-for-node at right position", (done) => {
    const genericRuntime = "ms-rest";
    const azureRuntime = "ms-rest-azure";
    const azureSDK = "Azure-SDK-For-Node";
    const userAgentArray = [`${genericRuntime}/v1.0.0`, `${azureRuntime}/v1.0.0`];
    const userAgentFilter = new MsRestUserAgentFilter(userAgentArray);
    const resource = new WebResource();
    resource.headers = {};
    userAgentFilter.before(resource).then((resource) => {
      should.ok(resource);
      const deconstructedUserAgent = resource.headers[userAgentHeader].split(" ");
      should.ok(deconstructedUserAgent);
      const indexOfAzureRuntime = deconstructedUserAgent.findIndex((e: string) => e.startsWith(azureRuntime));
      assert.notEqual(indexOfAzureRuntime, -1, `did not find ${azureRuntime} in user agent`);
      const indexOfAzureSDK = deconstructedUserAgent.indexOf(azureSDK);
      assert.notEqual(indexOfAzureSDK, -1, `did not find ${azureSDK} in user agent`);
      assert.equal(indexOfAzureSDK, 1 + indexOfAzureRuntime, `${azureSDK} is not in the right place in user agent string`);
      done();
    }).catch((err) => { done(err); });
  });
});
