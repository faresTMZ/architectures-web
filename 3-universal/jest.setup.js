import "@testing-library/jest-dom";

// Allow tests to override router properties when needed
const createRouter = () => ({
  route: "/",
  pathname: "",
  query: {},
  asPath: "",
  push: jest.fn(),
  replace: jest.fn(),
});

const useRouter = jest.fn().mockImplementation(() => createRouter());

jest.mock("next/router", () => ({
  useRouter,
}));

afterEach(() => {
  useRouter.mockImplementation(() => createRouter());
});

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ fill, priority, ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img data-fill={fill} data-priority={priority} {...props} />;
  },
}));

// Mock fetch globally
global.fetch = jest.fn();
