import { Link } from 'react-router-dom';
import logo from '../logo-transparent.png';

function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>

                {/* Stolpec 1 - Logo in opis */}
                <div style={styles.column}>
                    <img
                        src={logo}
                        alt="KinoPlex"
                        style={styles.logo}
                    />
                    <p style={styles.description}>
                        KinoPlex je moderni kinematograf, ki vam ponuja
                        najboljso filmsko izkusnjo v udobnem okolju.
                        Rezervirajte svoje sedeže po spletu in uživajte v filmu!
                    </p>
                </div>

                {/* Stolpec 2 - Navigacija */}
                <div style={styles.column}>
                    <h4 style={styles.columnTitle}>Navigacija</h4>
                    <Link to="/" style={styles.footerLink}>Domov</Link>
                    <Link to="/program" style={styles.footerLink}>Program</Link>
                    <Link to="/my-reservations" style={styles.footerLink}>
                        Moje vstopnice
                    </Link>
                    <Link to="/login" style={styles.footerLink}>Prijava</Link>
                    <Link to="/register" style={styles.footerLink}>
                        Registracija
                    </Link>
                </div>

                {/* Stolpec 3 - Kontakt */}
                <div style={styles.column}>
                    <h4 style={styles.columnTitle}>Kontakt</h4>
                    <p style={styles.contactItem}>
                        Filmska ulica 1
                    </p>
                    <p style={styles.contactItem}>
                        1000 Ljubljana, Slovenija
                    </p>
                    <p style={styles.contactItem}>
                        Tel: +386 1 234 56 78
                    </p>
                    <p style={styles.contactItem}>
                        E-posta: info@kinoplex.si
                    </p>
                    <p style={styles.contactItem}>
                        Delovni cas: vsak dan 10:00 - 23:00
                    </p>
                </div>

                {/* Stolpec 4 - Impressum */}
                <div style={styles.column}>
                    <h4 style={styles.columnTitle}>Impressum</h4>
                    <p style={styles.contactItem}>
                        KinoPlex d.o.o.
                    </p>
                    <p style={styles.contactItem}>
                        Maticna stevilka: 1234567000
                    </p>
                    <p style={styles.contactItem}>
                        Davcna stevilka: SI12345678
                    </p>
                    <p style={styles.contactItem}>
                        Transakcijski racun: SI56 1234 5678 9012 345
                    </p>
                    <p style={styles.contactItem}>
                        Register: Okrožno sodišče v Ljubljani
                    </p>
                </div>

            </div>

            {/* Spodnja vrstica */}
            <div style={styles.bottomBar}>
                <p style={styles.copyright}>
                    {new Date().getFullYear()} KinoPlex d.o.o. Vse pravice pridrzane.
                </p>
                <div style={styles.bottomLinks}>
                    <span style={styles.bottomLink}>Politika zasebnosti</span>
                    <span style={styles.separator}>·</span>
                    <span style={styles.bottomLink}>Splošni pogoji</span>
                    <span style={styles.separator}>·</span>
                    <span style={styles.bottomLink}>Piškotki</span>
                </div>
            </div>
        </footer>
    );
}

const styles = {
    footer: {
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: '60px',
    },
    inner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 20px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    logo: {
        height: '40px',
        width: 'auto',
        objectFit: 'contain',
        marginBottom: '8px',
        alignSelf: 'flex-start',
    },
    description: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
        lineHeight: 1.6,
    },
    columnTitle: {
        color: '#00c9b1',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '8px',
    },
    footerLink: {
        color: 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.2s',
    },
    contactItem: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: '13px',
        lineHeight: 1.5,
    },
    bottomBar: {
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
    },
    copyright: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px',
    },
    bottomLinks: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    bottomLink: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: '12px',
        cursor: 'pointer',
    },
    separator: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: '12px',
    },
};

export default Footer;