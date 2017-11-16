#ifdef GL_ES
precision highp float;
#endif

varying vec4 vFinalColor;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform bool uUseTexture;

uniform float normScale;

//uniform vec4 sel_col = vec4(1.0, 0.0, 0.0, 0.0);

void main() {
	// Branching should be reduced to a minimal. 
	// When based on a non-changing uniform, it is usually optimized.

	vec4 sel_col = vec4(0.9, 0.1, 0.1, 1.0);	

	if (uUseTexture)
	{
		vec4 textureColor = texture2D(uSampler, vTextureCoord);
		gl_FragColor = mix(textureColor * vFinalColor, sel_col, normScale);
	}
	else
		gl_FragColor = mix(vFinalColor, sel_col, normScale);

}
