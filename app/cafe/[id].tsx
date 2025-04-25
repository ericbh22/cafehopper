  return imageUrls.map((img: string, idx: number) => {
    console.log(`Attempting to load image ${idx}: ${img}`); // Debug log
    return (
      <Image 
        key={idx} 
        source={{ uri: img }} 
        className="w-48 h-48 rounded-xl"
        style={{ objectFit: 'cover' }}
        onError={(e) => {
          console.error(`Error loading image ${idx}:`, e.nativeEvent.error);
          console.error('Failed URL:', img);
        }}
      />
    );
  });
})() : (
  <Image 
    source={{ uri: cafe.image || 'https://source.unsplash.com/800x600/?cafe' }} 
    className="w-48 h-48 rounded-xl"
    style={{ objectFit: 'cover' }}
    onError={(e) => {
      console.error('Error loading default image:', e.nativeEvent.error);
    }}
  />
)} 