export const convertPicture = (pic: { data: Uint8Array; format: string; }) => {
    let binary = '';
    const len = pic.data.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(pic.data[i]);
    }
    const base64String = btoa(binary);
    return `data:${pic.format};base64,${base64String}`;
  }