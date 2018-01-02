#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

// Changes the color of the object in function of a normscale that varies between -1, 1
void main() {
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = vec4(textureColor.rgb * vFinalColor.rgb, textureColor.a * vFinalColor.a);
}
