export const metadata = {
  title: 'Seasonal Home Checklist',
  description: 'Quarterly home maintenance, personalized by ZIP and features'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
