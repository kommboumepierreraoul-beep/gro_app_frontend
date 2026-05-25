import "./globals.css";

export const metadata = {
  title: "Gro App",
  description: "Application de gestion agricole",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet" />
        {/* Police pour les icônes Material Symbols */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" 
          rel="stylesheet" 
        />
      </head>
      {/* suppressHydrationWarning évite l’erreur d’hydratation */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}