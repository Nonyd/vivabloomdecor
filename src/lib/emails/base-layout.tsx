import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

const baseUrl = "https://vivabloomdecor.com.au";

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Vivabloom</Text>
            <Text style={styles.tagline}>Luxury Event & Wedding Décor</Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.content}>{children}</Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>Melbourne, Victoria, Australia</Text>
            <Text style={styles.footerText}>
              <Link href={`${baseUrl}`} style={styles.footerLink}>
                vivabloomdecor.com.au
              </Link>
              {" · "}
              <Link href={`${baseUrl}/privacy`} style={styles.footerLink}>
                Privacy
              </Link>
            </Text>
            <Text style={styles.footerSmall}>
              © {new Date().getFullYear()} Vivabloom Decor. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#F8F5EE",
    fontFamily: "Georgia, serif",
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: "#FFFFFF",
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "4px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#0F0E0C",
    padding: "36px 48px",
    textAlign: "center" as const,
  },
  logo: {
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontStyle: "italic",
    color: "#C9A96E",
    margin: 0,
    letterSpacing: "2px",
  },
  tagline: {
    fontFamily: "Arial, sans-serif",
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.4)",
    margin: "8px 0 0",
  },
  divider: {
    borderColor: "#C9A96E",
    borderWidth: "1px",
    margin: 0,
    opacity: 0.4,
  },
  content: {
    padding: "48px",
  },
  footer: {
    padding: "24px 48px 36px",
    textAlign: "center" as const,
  },
  footerText: {
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    color: "#9B9589",
    margin: "4px 0",
  },
  footerLink: {
    color: "#C9A96E",
    textDecoration: "none",
  },
  footerSmall: {
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    color: "#C5BEB4",
    marginTop: "12px",
  },
};
