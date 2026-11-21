export default function NetworkError({ message = 'Network error. Please try again later.' }) {
  return (
    <div style={{padding: 24, background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.28)', borderRadius: 8, color: '#FCA5A5'}}>
      <div style={{fontWeight: 700, marginBottom: 6, color: '#F87171'}}>Network Error</div>
      <div>{message}</div>
    </div>
  );
}
