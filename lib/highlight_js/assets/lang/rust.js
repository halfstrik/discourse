hljs.registerLanguage("rust",function(e){var t=e.inherit(e.CBCM);return t.c.push("self"),{aliases:["rs"],k:{keyword:"alignof as be box break const continue crate do else enum extern false fn for if impl in let loop match mod mut offsetof once priv proc pub pure ref return self sizeof static struct super trait true type typeof unsafe unsized use virtual while yield int i8 i16 i32 i64 uint u8 u32 u64 float f32 f64 str char bool",built_in:"assert! assert_eq! bitflags! bytes! cfg! col! concat! concat_idents! debug_assert! debug_assert_eq! env! panic! file! format! format_args! include_bin! include_str! line! local_data_key! module_path! option_env! print! println! select! stringify! try! unimplemented! unreachable! vec! write! writeln!"},l:e.IR+"!?",i:"</",c:[e.CLCM,t,e.inherit(e.QSM,{i:null}),{cN:"string",b:/r(#*)".*?"\1(?!#)/},{cN:"string",b:/'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/},{b:/'[a-zA-Z_][a-zA-Z0-9_]*/},{cN:"number",b:/\b(0[xbo][A-Fa-f0-9_]+|\d[\d_]*(\.[0-9_]+)?([eE][+-]?[0-9_]+)?)([uif](8|16|32|64|size))?/,r:0},{cN:"function",bK:"fn",e:"(\\(|<)",eE:!0,c:[e.UTM]},{cN:"preprocessor",b:"#\\!?\\[",e:"\\]"},{bK:"type",e:"(=|<)",c:[e.UTM],i:"\\S"},{bK:"trait enum",e:"({|<)",c:[e.UTM],i:"\\S"},{b:e.IR+"::"},{b:"->"}]}});