import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['./test/**/*.test.ts'],
        exclude: ['./test/test-vectors.ts'],
        coverage: {
            provider: 'c8'
        }
    },
});
