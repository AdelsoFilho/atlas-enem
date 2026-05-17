/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\.tsx?$": ["ts-jest", {
      tsconfig: {
        lib: ["es2020"],
        module: "commonjs",
        moduleResolution: "node",
        esModuleInterop: true,
      },
    }],
  },
}
