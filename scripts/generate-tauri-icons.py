#!/usr/bin/env python3
"""
Generate Tauri icons (.icns, .ico, and size PNGs) from a source PNG.
Uses only Python standard library (struct, zlib) to avoid external dependencies.

Usage: python3 generate-tauri-icons.py <source_png> <output_dir> [temp_dir]
"""

import struct
import sys
import os
import zlib
import subprocess
import shutil


def validate_png(path):
    """Validate that a file is a proper PNG by checking signature and chunks."""
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 24:
        return False, "file too small"
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        return False, "bad PNG signature"
    pos = 8
    idat_found = False
    iend_found = False
    while pos < len(data):
        if pos + 8 > len(data):
            break
        length = struct.unpack(">I", data[pos:pos+4])[0]
        chunk_type = data[pos+4:pos+8]
        chunk_end = pos + 8 + length
        if chunk_end > len(data):
            return False, f"chunk {chunk_type} extends past EOF"
        crc_calc = zlib.crc32(data[pos+4:chunk_end]) & 0xffffffff
        crc_stored = struct.unpack(">I", data[chunk_end:chunk_end+4])[0]
        if crc_calc != crc_stored:
            return False, f"CRC mismatch in {chunk_type}"
        if chunk_type == b'IDAT':
            idat_found = True
        elif chunk_type == b'IEND':
            iend_found = True
            break
        elif chunk_type == b'IHDR':
            if length != 13:
                return False, "IHDR wrong length"
        pos = chunk_end + 4
    if not idat_found:
        return False, "no IDAT chunk"
    if not iend_found:
        return False, "no IEND chunk"
    return True, "OK"


def build_icns(iconset_dir, output_path):
    """Build a .icns file from an iconset directory.
    
    ICNS format: 'icns' magic (4) + totalSize (4) + entries...
    Each entry: iconType (4) + entrySize (4) + pngData
    """
    icns_specs = [
        (16, 'icp4', 'icon_16x16.png'),
        (32, 'icp5', 'icon_16x16@2x.png'),
        (32, 'icp6', 'icon_32x32.png'),
        (64, 'icp7', 'icon_32x32@2x.png'),
        (128, 'ic07', 'icon_128x128.png'),
        (256, 'ic08', 'icon_128x128@2x.png'),
        (256, 'ic09', 'icon_256x256.png'),
        (512, 'ic0a', 'icon_256x256@2x.png'),
        (512, 'ic0b', 'icon_512x512.png'),
        (1024, 'ic0c', 'icon_512x512@2x.png'),
    ]
    
    entry_data = b""
    for sz, code, name in icns_specs:
        path = os.path.join(iconset_dir, name)
        valid, msg = validate_png(path)
        if not valid:
            print(f"ERROR: Invalid PNG: {name} - {msg}")
            return False
        with open(path, "rb") as f:
            png_data = f.read()
        entry_size = 8 + len(png_data)
        entry_data += code.encode() + struct.pack(">I", entry_size) + png_data
        print(f"  OK {name} ({sz}px) - {len(png_data)} bytes")
    
    total_size = 8 + len(entry_data)
    icns_content = b'icns' + struct.pack(">I", total_size) + entry_data
    
    with open(output_path, "wb") as f:
        f.write(icns_content)
    print(f"OK icon.icns generated ({total_size} bytes)")
    return True


def build_ico(ico_tmp_dir, output_path):
    """Build a .ico file from PNG files in a temp directory.
    
    ICO format: header (6 bytes) + directory entries (16 bytes each) + PNG data
    """
    ico_sizes = [16, 32, 48, 64, 128, 256]
    ico_pngs = []
    
    for sz in ico_sizes:
        path = os.path.join(ico_tmp_dir, f"{sz}.png")
        valid, msg = validate_png(path)
        if not valid:
            print(f"ERROR: Invalid ICO PNG: {sz}.png - {msg}")
            return False
        with open(path, "rb") as f:
            ico_pngs.append(f.read())
        print(f"  OK {sz}.png - {len(ico_pngs[-1])} bytes")
    
    # ICO header: reserved (0), type (1 = .ico), count
    hdr = struct.pack("<HHH", 0, 1, len(ico_sizes))
    # Directory entries: width, height, colors, reserved, planes, bpp, size, offset
    entries = b""
    offset = 6 + 16 * len(ico_sizes)
    for i, sz in enumerate(ico_sizes):
        w = 0 if sz >= 256 else sz
        h = 0 if sz >= 256 else sz
        entries += struct.pack("<BBBBHHII", w, h, 0, 0, 1, 32, len(ico_pngs[i]), offset)
        offset += len(ico_pngs[i])
    
    with open(output_path, "wb") as f:
        f.write(hdr + entries + b"".join(ico_pngs))
    print(f"OK icon.ico generated ({offset} bytes)")
    return True


def generate_png_with_sips(source, size, output_path):
    """Generate a PNG of given size using macOS sips tool."""
    try:
        result = subprocess.run(
            ["sips", "-z", str(size), str(size), source, "--out", output_path],
            capture_output=True,
            timeout=30
        )
        if result.returncode != 0:
            print(f"WARNING: sips failed for {size}px: {result.stderr.decode()}")
            return False
        return True
    except FileNotFoundError:
        print("ERROR: sips not found")
        return False
    except Exception as e:
        print(f"ERROR: sips exception: {e}")
        return False


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 generate-tauri-icons.py <source_png> <output_dir> [temp_dir]")
        sys.exit(1)
    
    source_png = sys.argv[1]
    output_dir = sys.argv[2]
    temp_dir = sys.argv[3] if len(sys.argv) > 3 else "/tmp/tauri-icon-temp"
    
    if not os.path.exists(source_png):
        print(f"ERROR: Source PNG not found: {source_png}")
        sys.exit(1)
    
    # Validate source
    valid, msg = validate_png(source_png)
    if not valid:
        print(f"ERROR: Source PNG is invalid: {msg}")
        sys.exit(1)
    print(f"Source PNG validated: {source_png}")
    
    # Create directories
    os.makedirs(output_dir, exist_ok=True)
    iconset_dir = os.path.join(temp_dir, "iconset")
    ico_dir = os.path.join(temp_dir, "ico")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(iconset_dir, exist_ok=True)
    os.makedirs(ico_dir, exist_ok=True)
    
    # 1. Generate PNGs for tauri.conf.json (used by Tauri bundler)
    print("=== Generating Tauri icon PNGs ===")
    for sz in [16, 32, 48, 64, 128, 256, 512, 1024]:
        out = os.path.join(output_dir, f"{sz}x{sz}.png")
        if not generate_png_with_sips(source_png, sz, out):
            print(f"ERROR: Failed to generate {sz}x{sz}.png")
            sys.exit(1)
    # icon.png is typically 512x512
    shutil.copy2(os.path.join(output_dir, "512x512.png"), os.path.join(output_dir, "icon.png"))
    
    # 2. Generate PNGs for iconset (10 sizes with correct names)
    print("=== Generating iconset PNGs ===")
    iconset_sizes = [
        (16, 'icon_16x16.png'),
        (32, 'icon_16x16@2x.png'),
        (32, 'icon_32x32.png'),
        (64, 'icon_32x32@2x.png'),
        (128, 'icon_128x128.png'),
        (256, 'icon_128x128@2x.png'),
        (256, 'icon_256x256.png'),
        (512, 'icon_256x256@2x.png'),
        (512, 'icon_512x512.png'),
        (1024, 'icon_512x512@2x.png'),
    ]
    for sz, name in iconset_sizes:
        out = os.path.join(iconset_dir, name)
        if not generate_png_with_sips(source_png, sz, out):
            print(f"ERROR: Failed to generate iconset {name}")
            sys.exit(1)
    
    # 3. Generate ICO PNGs
    print("=== Generating ICO PNGs ===")
    for sz in [16, 32, 48, 64, 128, 256]:
        out = os.path.join(ico_dir, f"{sz}.png")
        if not generate_png_with_sips(source_png, sz, out):
            print(f"ERROR: Failed to generate ICO {sz}.png")
            sys.exit(1)
    
    # 4. Build .icns
    print("=== Building icon.icns ===")
    icns_path = os.path.join(output_dir, "icon.icns")
    if not build_icns(iconset_dir, icns_path):
        sys.exit(1)
    
    # 5. Build .ico
    print("=== Building icon.ico ===")
    ico_path = os.path.join(output_dir, "icon.ico")
    if not build_ico(ico_dir, ico_path):
        sys.exit(1)
    
    # 6. Cleanup temp
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    # 7. Verify output
    print("=== Final Tauri icons ===")
    for f in sorted(os.listdir(output_dir)):
        path = os.path.join(output_dir, f)
        size = os.path.getsize(path)
        print(f"  {f} ({size} bytes)")
    print("All Tauri icons generated successfully!")


if __name__ == '__main__':
    main()