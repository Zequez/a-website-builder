export default new (class UrlHash {
  getData(): Record<string, string> {
    const hash = window.location.hash.replace(/^#\??/, '');
    return Object.fromEntries(
      hash.split('&').map((part) => {
        return part.split('=');
      }),
    );
  }

  setData(data: Record<string, string>) {
    window.location.hash = '?' + this.generate(data);
  }

  generate(data: Record<string, string>) {
    const hash = Object.entries(data)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return hash;
  }
})();
