const {assert} = require("chai");

const {
  getUserByEmail,
  generateRandomString,
  formatURL,
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    };
    assert.deepEqual(user, expectedUserID);
  });

  it("should return undefined with an invalid email", function () {
    const user = getUserByEmail("user123@example.com", testUsers);
    const expectedResult = undefined;
    assert.equal(user, expectedResult);
  });
});

describe("generateRandomString", function () {
  it("should return a string", function () {
    const string = generateRandomString();
    const stringType = typeof string;
    const expectedType = "string";
    assert.equal(stringType, expectedType);
  });

  it("should return a string of 6 characters", function () {
    const stringLength = generateRandomString().length;
    const expectedLength = 6;
    assert.equal(stringLength, expectedLength);
  });
});

describe("formatURL", function () {
  it("should return a url with 'http://' prepended if the submitted url doesn't does start with 'http://'", function () {
    const formattedURL = formatURL("google.com");
    const expectedURL = "http://google.com";
    assert.equal(formattedURL, expectedURL);
  });

  it("should return the original url if it starts with 'https://'", function () {
    const URL = formatURL("https://google.com");
    const expectedURL = "https://google.com";
    assert.equal(URL, expectedURL);
  });

  it("should return the original url if it starts with 'http://'", function () {
    const URL = formatURL("http://google.com");
    const expectedURL = "http://google.com";
    assert.equal(URL, expectedURL);
  });
});
