#!/usr/bin/env python3
"""Generate icon PNG and ICO files from a source image."""
import struct
import zlib
import sys
import os

def create_png(w, h, r, g, b):
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
    raw = b''
    for y in range(h):
        raw += b'\x00' + bytes([r, g, b]) * w
    idat = chunk(b'IDAT', zlib.compress(raw))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def create_default_icon(output_path, size=512):
    """Create a simple green icon"""
    png_data = create_png(size, size, 51, 153, 51)
    with open(output_path, 'wb') as f:
        f.write(png_data)
    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python generate-icons.py <output_dir> [source_png]")
        sys.exit(1)
    
    output_dir = sys.argv[1]
    source_png = sys.argv[2] if len(sys.argv) > 2 else None
    
    os.makedirs(output_dir, exist_ok=True)
    
    if source_png and os.path.exists(source_png):
        import shutil
        base_icon = source_png
    else:
        base_icon = os.path.join(output_dir, 'source.png')
        create_default_icon(base_icon)
    
    print(f"✅ Icon source prepared: {base_icon}")
