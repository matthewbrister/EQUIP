import React from 'react';

export default function AboutView({ setCurrentView }) {
  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem', maxWidth: '760px' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>About EQUIP</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          EQUIP is the EAST Quick Utility and Inventory Platform. It helps facilitators manage programs,
          technology, rosters, access codes, and student project reviews while giving approved programs
          a controlled public presence.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          This project was created by Matthew Brister, an EAST student.
        </p>
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3>Google sign-in</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>EQUIP receives only name, email, and profile picture from Google OAuth.</p>
          </div>
          <div>
            <h3>Secure access</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Passwords are not collected or stored.</p>
          </div>
          <div>
            <h3>Program workflow</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Facilitators manage approved programs and students join with an access code.</p>
          </div>
        </div>
        <section aria-labelledby="privacy-policy-title" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 id="privacy-policy-title" style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>Privacy Policy</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            EQUIP uses information to provide sign-in, program workspaces, inventory management, and project review.
            It does not collect or store passwords.
          </p>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Information used</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Google sign-in provides your name, email address, profile picture, and account identifier. EQUIP also
            stores the role and program information needed to operate the service, including a student’s grade when
            provided. Program workspaces may contain facilitator contact details, student roster information,
            equipment records, and project descriptions, team names, images, and communication notes entered by users.
          </p>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Storage and sharing</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Firebase Authentication and Firestore store account and workspace data. Uploaded program, equipment,
            and project images are hosted by Cloudinary. These services process data to provide EQUIP’s features.
            Facilitators and the website administrator can access workspace information for their responsibilities.
            Approved program information, including its facilitator contact details, may be publicly readable.
            Approved projects and equipment may also be publicly readable when the program’s visibility settings allow it;
            avoid including private or sensitive information in content that could be published.
          </p>

          <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>Preferences and data requests</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
            Interface preferences are saved in your browser. Students and facilitators who do not own a program can
            permanently delete their account from Preferences after confirming their Google sign-in. This removes
            their account and student roster membership, but submitted projects and their images remain in the program
            workspace. Facilitators who own a program must contact the administrator to transfer or archive it first.
            For data questions or requests, contact the website administrator at{' '}
            <a href="mailto:matthewbristergaming@gmail.com">matthewbristergaming@gmail.com</a>.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            Students should use EQUIP with their facilitator’s guidance and should not submit sensitive personal
            information about themselves or others.
          </p>
        </section>
        <button type="button" className="btn btn-primary" onClick={() => setCurrentView('auth')}>
          <i className="bx bx-log-in"></i>
          <span>Continue with Google</span>
        </button>
      </section>
    </div>
  );
}
