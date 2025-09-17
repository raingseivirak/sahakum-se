export default function WorkingPage() {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#006AA7',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        🎉 Next.js is Working!
      </h1>
      <h2 style={{
        backgroundColor: '#FECC02',
        color: '#006AA7',
        padding: '20px',
        borderRadius: '10px',
        display: 'inline-block'
      }}>
        Sahakum Khmer CMS
      </h2>
      <p style={{ fontSize: '24px', margin: '30px 0' }}>
        This page proves that Next.js routing is functional.
      </p>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        <h3>If you can see this page, the issue is with the [locale] routing setup.</h3>
        <p>We need to fix the internationalization configuration.</p>
      </div>
    </div>
  );
}