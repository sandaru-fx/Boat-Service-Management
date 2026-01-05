import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
	config: {
		initialColorMode: 'light',
		useSystemColorMode: false,
	},
	colors: {
		brand: {
			50: '#e6f3ff',
			100: '#b3d9ff',
			200: '#80bfff',
			300: '#4da6ff',
			400: '#1a8cff',
			500: '#0073e6',
			600: '#005bb3',
			700: '#004280',
			800: '#002a4d',
			900: '#00111a',
		},
	},
	fonts: {
		heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
		body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
	},
	components: {
		Button: {
			variants: {
				solid: {
					bg: 'brand.500',
					color: 'white',
					_hover: {
						bg: 'brand.600',
					},
				},
			},
		},
	},
});

export default theme;