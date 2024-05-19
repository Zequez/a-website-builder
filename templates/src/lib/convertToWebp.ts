// Thank you for your assistance ChatGPT

export default function convertToWebp(
  file: File,
  sizes: number[],
  quality = 80,
): Promise<{ files: File[]; originalSize: { width: number; height: number } }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const conversions: { w: number; h: number }[] = [];

      for (const size of sizes) {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to fit into a square of the specified size
        if (width > height) {
          if (width > size) {
            height *= size / width;
            width = size;
          }
        } else {
          if (height > size) {
            width *= size / height;
            height = size;
          }
        }

        if (width !== img.width || height !== img.height) {
          conversions.push({ w: width, h: height });
        }
      }

      if (conversions.length === 0) {
        conversions.push({ w: img.width, h: img.height });
      }

      let files: File[] = [];
      for (const { w, h } of conversions) {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const newFile = await new Promise<File>((resolveToBlob, rejectToBlob) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newName = file.name.replace(/\.(jpg|png|gif|webp)$/, '.webp');
                  resolveToBlob(new File([blob], newName, { type: 'image/webp' }));
                } else {
                  console.log('No blob!');
                  reject();
                }
              },
              'image/webp',
              quality / 100,
            );
          });
          files.push(newFile);
        } catch (e) {
          console.error('Some conversion error', e);
          reject();
        }
      }

      resolve({ files, originalSize: { width: img.width, height: img.height } });
    };
    img.src = URL.createObjectURL(file);
  });
}
