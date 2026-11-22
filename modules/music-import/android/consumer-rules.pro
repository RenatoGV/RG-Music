# Commons Compress creates ZIP extra fields via Class.newInstance() when
# extracting the embedded Python and FFmpeg distributions on first use.
-keep,allowobfuscation class * implements org.apache.commons.compress.archivers.zip.ZipExtraField {
    public <init>();
}
