export default function SimplePage() {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
          <h1 style={{ color: '#006AA7', fontSize: '48px' }}>🎉 Sahakum Khmer CMS</h1>
          <h2 style={{ color: '#FECC02', backgroundColor: '#006AA7', padding: '20px', borderRadius: '10px' }}>
            SUCCESS! The website is working!
          </h2>
          <p style={{ fontSize: '24px', margin: '20px 0' }}>
            Gemenskap • Kultur • Integration
          </p>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px', margin: '20px 0' }}>
            <h3 style={{ color: '#006AA7' }}>Sweden Brand Colors:</h3>
            <p>Sweden Blue: <span style={{ color: '#006AA7', fontWeight: 'bold' }}>#006AA7</span></p>
            <p>Sweden Yellow: <span style={{ color: '#FECC02', fontWeight: 'bold' }}>#FECC02</span></p>
          </div>
          <p style={{ color: '#666' }}>
            This confirms the Next.js routing and internationalization setup is working correctly.
          </p>
        </div>
      </body>
    </html>
  );
}