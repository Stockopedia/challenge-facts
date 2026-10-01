import type { Metadata } from "next";
import type { FunctionComponent, PropsWithChildren } from "react";

import "../styles/globals.css";

export const metadata: Metadata = {
	title: "Stockopedia facts challenge",
	description: "Coding challenge for Stockopedia Ltd",
	icons: { icon: "/images/favicon.ico" },
};

const RootLayout: FunctionComponent<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<head>
			<link
				href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap"
				rel="stylesheet"
			/>
		</head>
		<body>{children}</body>
	</html>
);

export default RootLayout;
