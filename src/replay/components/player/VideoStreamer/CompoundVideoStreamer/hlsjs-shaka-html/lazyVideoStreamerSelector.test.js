// TODO: Implement when Enzyme supports React.lazy.
test("selectVideoStreamerImporter() returns a lazily loaded ShakaVideoStreamer if the source's stream type is MPEG-DASH.", () => {});
test("selectVideoStreamerImporter() returns a lazily loaded HlsjsVideoStreamer if the source's stream type is HLS, and the browser is not Safari.", () => {});
test("selectVideoStreamerImporter() returns a lazily loaded HtmlVideoStreamer if the source's stream type is HLS, and the browser is Safari", () => {});
test("selectVideoStreamerImporter() returns a lazily loaded BasicVideoStreamer if the source's stream type cannot be detected as HLS or MPEG-DASH.", () => {});
test('selectVideoStreamerImporter() returns a lazily loaded BasicVideoStreamer if the source is null.', () => {});
