"use strict";

(function(){

const $JSRTS = {
    throw: function (x) {
        throw x;
    },
    Lazy: function (e) {
        this.js_idris_lazy_calc = e;
        this.js_idris_lazy_val = void 0;
    },
    force: function (x) {
        if (x === undefined || x.js_idris_lazy_calc === undefined) {
            return x
        } else {
            if (x.js_idris_lazy_val === undefined) {
                x.js_idris_lazy_val = x.js_idris_lazy_calc()
            }
            return x.js_idris_lazy_val
        }
    },
    prim_strSubstr: function (offset, len, str) {
        return str.substr(Math.max(0, offset), Math.max(0, len))
    }
};
$JSRTS.prim_systemInfo = function (index) {
    switch (index) {
        case 0:
            return "javascript";
        case 1:
            return navigator.platform;
    }
    return "";
};

$JSRTS.prim_writeStr = function (x) { return console.log(x) };

$JSRTS.prim_readStr = function () { return prompt('Prelude.getLine') };

$JSRTS.die = function (message) { throw new Error(message) };
$JSRTS.jsbn = (function () {

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary & 0xffffff) == 0xefcafe);

  // (public) Constructor
  function BigInteger(a, b, c) {
    if (a != null)
      if ("number" == typeof a) this.fromNumber(a, b, c);
      else if (b == null && "string" != typeof a) this.fromString(a, 256);
      else this.fromString(a, b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i, x, w, j, c, n) {
    while (--n >= 0) {
      var v = x * this[i++] + w[j] + c;
      c = Math.floor(v / 0x4000000);
      w[j++] = v & 0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i, x, w, j, c, n) {
    var xl = x & 0x7fff, xh = x >> 15;
    while (--n >= 0) {
      var l = this[i] & 0x7fff;
      var h = this[i++] >> 15;
      var m = xh * l + h * xl;
      l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
      c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
      w[j++] = l & 0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i, x, w, j, c, n) {
    var xl = x & 0x3fff, xh = x >> 14;
    while (--n >= 0) {
      var l = this[i] & 0x3fff;
      var h = this[i++] >> 14;
      var m = xh * l + h * xl;
      l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
      c = (l >> 28) + (m >> 14) + xh * h;
      w[j++] = l & 0xfffffff;
    }
    return c;
  }
  var inBrowser = typeof navigator !== "undefined";
  if (inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if (inBrowser && j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1 << dbits) - 1);
  BigInteger.prototype.DV = (1 << dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2, BI_FP);
  BigInteger.prototype.F1 = BI_FP - dbits;
  BigInteger.prototype.F2 = 2 * dbits - BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr, vv;
  rr = "0".charCodeAt(0);
  for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s, i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c == null) ? -1 : c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x < 0) ? -1 : 0;
    if (x > 0) this[0] = x;
    else if (x < -1) this[0] = x + this.DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s, b) {
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 256) k = 8; // byte array
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else { this.fromRadix(s, b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while (--i >= 0) {
      var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if (sh == 0)
        this[this.t++] = x;
      else if (sh + k > this.DB) {
        this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
        this[this.t++] = (x >> (this.DB - sh));
      }
      else
        this[this.t - 1] |= x << sh;
      sh += k;
      if (sh >= this.DB) sh -= this.DB;
    }
    if (k == 8 && (s[0] & 0x80) != 0) {
      this.s = -1;
      if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
    }
    this.clamp();
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s & this.DM;
    while (this.t > 0 && this[this.t - 1] == c)--this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if (this.s < 0) return "-" + this.negate().toString(b);
    var k;
    if (b == 16) k = 4;
    else if (b == 8) k = 3;
    else if (b == 2) k = 1;
    else if (b == 32) k = 5;
    else if (b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
    var p = this.DB - (i * this.DB) % k;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) > 0) { m = true; r = int2char(d); }
      while (i >= 0) {
        if (p < k) {
          d = (this[i] & ((1 << p) - 1)) << (k - p);
          d |= this[--i] >> (p += this.DB - k);
        }
        else {
          d = (this[i] >> (p -= k)) & km;
          if (p <= 0) { p += this.DB; --i; }
        }
        if (d > 0) m = true;
        if (m) r += int2char(d);
      }
    }
    return m ? r : "0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this, r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s < 0) ? this.negate() : this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s - a.s;
    if (r != 0) return r;
    var i = this.t;
    r = i - a.t;
    if (r != 0) return (this.s < 0) ? -r : r;
    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if ((t = x >>> 16) != 0) { x = t; r += 16; }
    if ((t = x >> 8) != 0) { x = t; r += 8; }
    if ((t = x >> 4) != 0) { x = t; r += 4; }
    if ((t = x >> 2) != 0) { x = t; r += 2; }
    if ((t = x >> 1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if (this.t <= 0) return 0;
    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n, r) {
    var i;
    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
    for (i = n - 1; i >= 0; --i) r[i] = 0;
    r.t = this.t + n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n, r) {
    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
    r.t = Math.max(this.t - n, 0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n, r) {
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << cbs) - 1;
    var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
    for (i = this.t - 1; i >= 0; --i) {
      r[i + ds + 1] = (this[i] >> cbs) | c;
      c = (this[i] & bm) << bs;
    }
    for (i = ds - 1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t + ds + 1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n, r) {
    r.s = this.s;
    var ds = Math.floor(n / this.DB);
    if (ds >= this.t) { r.t = 0; return; }
    var bs = n % this.DB;
    var cbs = this.DB - bs;
    var bm = (1 << bs) - 1;
    r[0] = this[ds] >> bs;
    for (var i = ds + 1; i < this.t; ++i) {
      r[i - ds - 1] |= (this[i] & bm) << cbs;
      r[i - ds] = this[i] >> bs;
    }
    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
    r.t = this.t - ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] - a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c -= a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c -= a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c < -1) r[i++] = this.DV + c;
    else if (c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a, r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i + y.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
    r.s = 0;
    r.clamp();
    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2 * x.t;
    while (--i >= 0) r[i] = 0;
    for (i = 0; i < x.t - 1; ++i) {
      var c = x.am(i, x[i], r, 2 * i, 0, 1);
      if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
        r[i + x.t] -= x.DV;
        r[i + x.t + 1] = 1;
      }
    }
    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m, q, r) {
    var pm = m.abs();
    if (pm.t <= 0) return;
    var pt = this.abs();
    if (pt.t < pm.t) {
      if (q != null) q.fromInt(0);
      if (r != null) this.copyTo(r);
      return;
    }
    if (r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB - nbits(pm[pm.t - 1]);   // normalize modulus
    if (nsh > 0) { pm.lShiftTo(nsh, y); pt.lShiftTo(nsh, r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys - 1];
    if (y0 == 0) return;
    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
    var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
    var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
    y.dlShiftTo(j, t);
    if (r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t, r);
    }
    BigInteger.ONE.dlShiftTo(ys, t);
    t.subTo(y, y);  // "negative" y so we can replace sub with am later
    while (y.t < ys) y[y.t++] = 0;
    while (--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
      if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {   // Try it out
        y.dlShiftTo(j, t);
        r.subTo(t, r);
        while (r[i] < --qd) r.subTo(t, r);
      }
    }
    if (q != null) {
      r.drShiftTo(ys, q);
      if (ts != ms) BigInteger.ZERO.subTo(q, q);
    }
    r.t = ys;
    r.clamp();
    if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
    if (ts < 0) BigInteger.ZERO.subTo(r, r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a, null, r);
    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m, null, x); }
  function cMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }
  function cSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if (this.t < 1) return 0;
    var x = this[0];
    if ((x & 1) == 0) return 0;
    var y = x & 3;       // y == 1/x mod 2^2
    y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
    y = (y * (2 - (x & 0xff) * y)) & 0xff;   // y == 1/x mod 2^8
    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;    // y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y * (2 - x * y % this.DV)) % this.DV;       // y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y > 0) ? this.DV - y : -y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp & 0x7fff;
    this.mph = this.mp >> 15;
    this.um = (1 << (m.DB - 15)) - 1;
    this.mt2 = 2 * m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t, r);
    r.divRemTo(this.m, null, r);
    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while (x.t <= this.mt2) // pad x so am has enough room later
      x[x.t++] = 0;
    for (var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i] & 0x7fff;
      var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i + this.m.t;
      x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
      // propagate carry
      while (x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t, x);
    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e, z) {
    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
    g.copyTo(r);
    while (--i >= 0) {
      z.sqrTo(r, r2);
      if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e, m) {
    var z;
    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e, z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // Copyright (c) 2005-2009  Tom Wu
  // All Rights Reserved.
  // See "LICENSE" for details.

  // Extended JavaScript BN functions, required for RSA private ops.

  // Version 1.1: new BigInteger("0", 10) returns "proper" zero
  // Version 1.2: square() API, isProbablePrime fix

  // (public)
  function bnClone() { var r = nbi(); this.copyTo(r); return r; }

  // (public) return value as integer
  function bnIntValue() {
    if (this.s < 0) {
      if (this.t == 1) return this[0] - this.DV;
      else if (this.t == 0) return -1;
    }
    else if (this.t == 1) return this[0];
    else if (this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
  }

  // (public) return value as byte
  function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }

  // (public) return value as short (assumes DB>=16)
  function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if (this.s < 0) return -1;
    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if (b == null) b = 10;
    if (this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b, cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d, y, z);
    while (y.signum() > 0) {
      r = (a + z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d, y, z);
    }
    return z.intValue().toString(b) + r;
  }

  // (protected) convert from radix string
  function bnpFromRadix(s, b) {
    this.fromInt(0);
    if (b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
    for (var i = 0; i < s.length; ++i) {
      var x = intAt(s, i);
      if (x < 0) {
        if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b * w + x;
      if (++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w, 0);
        j = 0;
        w = 0;
      }
    }
    if (j > 0) {
      this.dMultiply(Math.pow(b, j));
      this.dAddOffset(w, 0);
    }
    if (mi) BigInteger.ZERO.subTo(this, this);
  }

  // (protected) alternate constructor
  function bnpFromNumber(a, b, c) {
    if ("number" == typeof b) {
      // new BigInteger(int,int,RNG)
      if (a < 2) this.fromInt(1);
      else {
        this.fromNumber(a, c);
        if (!this.testBit(a - 1))    // force MSB set
          this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
        if (this.isEven()) this.dAddOffset(1, 0); // force odd
        while (!this.isProbablePrime(b)) {
          this.dAddOffset(2, 0);
          if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
        }
      }
    }
    else {
      // new BigInteger(int,RNG)
      var x = new Array(), t = a & 7;
      x.length = (a >> 3) + 1;
      b.nextBytes(x);
      if (t > 0) x[0] &= ((1 << t) - 1); else x[0] = 0;
      this.fromString(x, 256);
    }
  }

  // (public) convert to bigendian byte array
  function bnToByteArray() {
    var i = this.t, r = new Array();
    r[0] = this.s;
    var p = this.DB - (i * this.DB) % 8, d, k = 0;
    if (i-- > 0) {
      if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
        r[k++] = d | (this.s << (this.DB - p));
      while (i >= 0) {
        if (p < 8) {
          d = (this[i] & ((1 << p) - 1)) << (8 - p);
          d |= this[--i] >> (p += this.DB - 8);
        }
        else {
          d = (this[i] >> (p -= 8)) & 0xff;
          if (p <= 0) { p += this.DB; --i; }
        }
        if ((d & 0x80) != 0) d |= -256;
        if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
        if (k > 0 || d != this.s) r[k++] = d;
      }
    }
    return r;
  }

  function bnEquals(a) { return (this.compareTo(a) == 0); }
  function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }
  function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }

  // (protected) r = this op a (bitwise)
  function bnpBitwiseTo(a, op, r) {
    var i, f, m = Math.min(a.t, this.t);
    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
    if (a.t < this.t) {
      f = a.s & this.DM;
      for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
      r.t = this.t;
    }
    else {
      f = this.s & this.DM;
      for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
      r.t = a.t;
    }
    r.s = op(this.s, a.s);
    r.clamp();
  }

  // (public) this & a
  function op_and(x, y) { return x & y; }
  function bnAnd(a) { var r = nbi(); this.bitwiseTo(a, op_and, r); return r; }

  // (public) this | a
  function op_or(x, y) { return x | y; }
  function bnOr(a) { var r = nbi(); this.bitwiseTo(a, op_or, r); return r; }

  // (public) this ^ a
  function op_xor(x, y) { return x ^ y; }
  function bnXor(a) { var r = nbi(); this.bitwiseTo(a, op_xor, r); return r; }

  // (public) this & ~a
  function op_andnot(x, y) { return x & ~y; }
  function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a, op_andnot, r); return r; }

  // (public) ~this
  function bnNot() {
    var r = nbi();
    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
    r.t = this.t;
    r.s = ~this.s;
    return r;
  }

  // (public) this << n
  function bnShiftLeft(n) {
    var r = nbi();
    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
    return r;
  }

  // (public) this >> n
  function bnShiftRight(n) {
    var r = nbi();
    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
    return r;
  }

  // return index of lowest 1-bit in x, x < 2^31
  function lbit(x) {
    if (x == 0) return -1;
    var r = 0;
    if ((x & 0xffff) == 0) { x >>= 16; r += 16; }
    if ((x & 0xff) == 0) { x >>= 8; r += 8; }
    if ((x & 0xf) == 0) { x >>= 4; r += 4; }
    if ((x & 3) == 0) { x >>= 2; r += 2; }
    if ((x & 1) == 0)++r;
    return r;
  }

  // (public) returns index of lowest 1-bit (or -1 if none)
  function bnGetLowestSetBit() {
    for (var i = 0; i < this.t; ++i)
      if (this[i] != 0) return i * this.DB + lbit(this[i]);
    if (this.s < 0) return this.t * this.DB;
    return -1;
  }

  // return number of 1 bits in x
  function cbit(x) {
    var r = 0;
    while (x != 0) { x &= x - 1; ++r; }
    return r;
  }

  // (public) return number of set bits
  function bnBitCount() {
    var r = 0, x = this.s & this.DM;
    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
    return r;
  }

  // (public) true iff nth bit is set
  function bnTestBit(n) {
    var j = Math.floor(n / this.DB);
    if (j >= this.t) return (this.s != 0);
    return ((this[j] & (1 << (n % this.DB))) != 0);
  }

  // (protected) this op (1<<n)
  function bnpChangeBit(n, op) {
    var r = BigInteger.ONE.shiftLeft(n);
    this.bitwiseTo(r, op, r);
    return r;
  }

  // (public) this | (1<<n)
  function bnSetBit(n) { return this.changeBit(n, op_or); }

  // (public) this & ~(1<<n)
  function bnClearBit(n) { return this.changeBit(n, op_andnot); }

  // (public) this ^ (1<<n)
  function bnFlipBit(n) { return this.changeBit(n, op_xor); }

  // (protected) r = this + a
  function bnpAddTo(a, r) {
    var i = 0, c = 0, m = Math.min(a.t, this.t);
    while (i < m) {
      c += this[i] + a[i];
      r[i++] = c & this.DM;
      c >>= this.DB;
    }
    if (a.t < this.t) {
      c += a.s;
      while (i < this.t) {
        c += this[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while (i < a.t) {
        c += a[i];
        r[i++] = c & this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c < 0) ? -1 : 0;
    if (c > 0) r[i++] = c;
    else if (c < -1) r[i++] = this.DV + c;
    r.t = i;
    r.clamp();
  }

  // (public) this + a
  function bnAdd(a) { var r = nbi(); this.addTo(a, r); return r; }

  // (public) this - a
  function bnSubtract(a) { var r = nbi(); this.subTo(a, r); return r; }

  // (public) this * a
  function bnMultiply(a) { var r = nbi(); this.multiplyTo(a, r); return r; }

  // (public) this^2
  function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

  // (public) this / a
  function bnDivide(a) { var r = nbi(); this.divRemTo(a, r, null); return r; }

  // (public) this % a
  function bnRemainder(a) { var r = nbi(); this.divRemTo(a, null, r); return r; }

  // (public) [this/a,this%a]
  function bnDivideAndRemainder(a) {
    var q = nbi(), r = nbi();
    this.divRemTo(a, q, r);
    return new Array(q, r);
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n, w) {
    if (n == 0) return;
    while (this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while (this[w] >= this.DV) {
      this[w] -= this.DV;
      if (++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // A "null" reducer
  function NullExp() { }
  function nNop(x) { return x; }
  function nMulTo(x, y, r) { x.multiplyTo(y, r); }
  function nSqrTo(x, r) { x.squareTo(r); }

  NullExp.prototype.convert = nNop;
  NullExp.prototype.revert = nNop;
  NullExp.prototype.mulTo = nMulTo;
  NullExp.prototype.sqrTo = nSqrTo;

  // (public) this^e
  function bnPow(e) { return this.exp(e, new NullExp()); }

  // (protected) r = lower n words of "this * a", a.t <= n
  // "this" should be the larger one if appropriate.
  function bnpMultiplyLowerTo(a, n, r) {
    var i = Math.min(this.t + a.t, n);
    r.s = 0; // assumes a,this >= 0
    r.t = i;
    while (i > 0) r[--i] = 0;
    var j;
    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
    r.clamp();
  }

  // (protected) r = "this * a" without lower n words, n > 0
  // "this" should be the larger one if appropriate.
  function bnpMultiplyUpperTo(a, n, r) {
    --n;
    var i = r.t = this.t + a.t - n;
    r.s = 0; // assumes a,this >= 0
    while (--i >= 0) r[i] = 0;
    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
      r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
    r.clamp();
    r.drShiftTo(1, r);
  }

  // Barrett modular reduction
  function Barrett(m) {
    // setup Barrett
    this.r2 = nbi();
    this.q3 = nbi();
    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
    this.mu = this.r2.divide(m);
    this.m = m;
  }

  function barrettConvert(x) {
    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
    else if (x.compareTo(this.m) < 0) return x;
    else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
  }

  function barrettRevert(x) { return x; }

  // x = x mod m (HAC 14.42)
  function barrettReduce(x) {
    x.drShiftTo(this.m.t - 1, this.r2);
    if (x.t > this.m.t + 1) { x.t = this.m.t + 1; x.clamp(); }
    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
    x.subTo(this.r2, x);
    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
  }

  // r = x^2 mod m; x != r
  function barrettSqrTo(x, r) { x.squareTo(r); this.reduce(r); }

  // r = x*y mod m; x,y != r
  function barrettMulTo(x, y, r) { x.multiplyTo(y, r); this.reduce(r); }

  Barrett.prototype.convert = barrettConvert;
  Barrett.prototype.revert = barrettRevert;
  Barrett.prototype.reduce = barrettReduce;
  Barrett.prototype.mulTo = barrettMulTo;
  Barrett.prototype.sqrTo = barrettSqrTo;

  // (public) this^e % m (HAC 14.85)
  function bnModPow(e, m) {
    var i = e.bitLength(), k, r = nbv(1), z;
    if (i <= 0) return r;
    else if (i < 18) k = 1;
    else if (i < 48) k = 3;
    else if (i < 144) k = 4;
    else if (i < 768) k = 5;
    else k = 6;
    if (i < 8)
      z = new Classic(m);
    else if (m.isEven())
      z = new Barrett(m);
    else
      z = new Montgomery(m);

    // precomputation
    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
    g[1] = z.convert(this);
    if (k > 1) {
      var g2 = nbi();
      z.sqrTo(g[1], g2);
      while (n <= km) {
        g[n] = nbi();
        z.mulTo(g2, g[n - 2], g[n]);
        n += 2;
      }
    }

    var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
    i = nbits(e[j]) - 1;
    while (j >= 0) {
      if (i >= k1) w = (e[j] >> (i - k1)) & km;
      else {
        w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
        if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
      }

      n = k;
      while ((w & 1) == 0) { w >>= 1; --n; }
      if ((i -= n) < 0) { i += this.DB; --j; }
      if (is1) {    // ret == 1, don't bother squaring or multiplying it
        g[w].copyTo(r);
        is1 = false;
      }
      else {
        while (n > 1) { z.sqrTo(r, r2); z.sqrTo(r2, r); n -= 2; }
        if (n > 0) z.sqrTo(r, r2); else { t = r; r = r2; r2 = t; }
        z.mulTo(r2, g[w], r);
      }

      while (j >= 0 && (e[j] & (1 << i)) == 0) {
        z.sqrTo(r, r2); t = r; r = r2; r2 = t;
        if (--i < 0) { i = this.DB - 1; --j; }
      }
    }
    return z.revert(r);
  }

  // (public) gcd(this,a) (HAC 14.54)
  function bnGCD(a) {
    var x = (this.s < 0) ? this.negate() : this.clone();
    var y = (a.s < 0) ? a.negate() : a.clone();
    if (x.compareTo(y) < 0) { var t = x; x = y; y = t; }
    var i = x.getLowestSetBit(), g = y.getLowestSetBit();
    if (g < 0) return x;
    if (i < g) g = i;
    if (g > 0) {
      x.rShiftTo(g, x);
      y.rShiftTo(g, y);
    }
    while (x.signum() > 0) {
      if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
      if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
      if (x.compareTo(y) >= 0) {
        x.subTo(y, x);
        x.rShiftTo(1, x);
      }
      else {
        y.subTo(x, y);
        y.rShiftTo(1, y);
      }
    }
    if (g > 0) y.lShiftTo(g, y);
    return y;
  }

  // (protected) this % n, n < 2^26
  function bnpModInt(n) {
    if (n <= 0) return 0;
    var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
    if (this.t > 0)
      if (d == 0) r = this[0] % n;
      else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
    return r;
  }

  // (public) 1/this % m (HAC 14.61)
  function bnModInverse(m) {
    var ac = m.isEven();
    if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
    var u = m.clone(), v = this.clone();
    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
    while (u.signum() != 0) {
      while (u.isEven()) {
        u.rShiftTo(1, u);
        if (ac) {
          if (!a.isEven() || !b.isEven()) { a.addTo(this, a); b.subTo(m, b); }
          a.rShiftTo(1, a);
        }
        else if (!b.isEven()) b.subTo(m, b);
        b.rShiftTo(1, b);
      }
      while (v.isEven()) {
        v.rShiftTo(1, v);
        if (ac) {
          if (!c.isEven() || !d.isEven()) { c.addTo(this, c); d.subTo(m, d); }
          c.rShiftTo(1, c);
        }
        else if (!d.isEven()) d.subTo(m, d);
        d.rShiftTo(1, d);
      }
      if (u.compareTo(v) >= 0) {
        u.subTo(v, u);
        if (ac) a.subTo(c, a);
        b.subTo(d, b);
      }
      else {
        v.subTo(u, v);
        if (ac) c.subTo(a, c);
        d.subTo(b, d);
      }
    }
    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
    if (d.compareTo(m) >= 0) return d.subtract(m);
    if (d.signum() < 0) d.addTo(m, d); else return d;
    if (d.signum() < 0) return d.add(m); else return d;
  }

  var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
  var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

  // (public) test primality with certainty >= 1-.5^t
  function bnIsProbablePrime(t) {
    var i, x = this.abs();
    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i)
        if (x[0] == lowprimes[i]) return true;
      return false;
    }
    if (x.isEven()) return false;
    i = 1;
    while (i < lowprimes.length) {
      var m = lowprimes[i], j = i + 1;
      while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
      m = x.modInt(m);
      while (i < j) if (m % lowprimes[i++] == 0) return false;
    }
    return x.millerRabin(t);
  }

  // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
  function bnpMillerRabin(t) {
    var n1 = this.subtract(BigInteger.ONE);
    var k = n1.getLowestSetBit();
    if (k <= 0) return false;
    var r = n1.shiftRight(k);
    t = (t + 1) >> 1;
    if (t > lowprimes.length) t = lowprimes.length;
    var a = nbi();
    for (var i = 0; i < t; ++i) {
      //Pick bases at random, instead of starting at 2
      a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
      var y = a.modPow(r, this);
      if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
        var j = 1;
        while (j++ < k && y.compareTo(n1) != 0) {
          y = y.modPowInt(2, this);
          if (y.compareTo(BigInteger.ONE) == 0) return false;
        }
        if (y.compareTo(n1) != 0) return false;
      }
    }
    return true;
  }

  // protected
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.fromNumber = bnpFromNumber;
  BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
  BigInteger.prototype.changeBit = bnpChangeBit;
  BigInteger.prototype.addTo = bnpAddTo;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
  BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
  BigInteger.prototype.modInt = bnpModInt;
  BigInteger.prototype.millerRabin = bnpMillerRabin;

  // public
  BigInteger.prototype.clone = bnClone;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.byteValue = bnByteValue;
  BigInteger.prototype.shortValue = bnShortValue;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.toByteArray = bnToByteArray;
  BigInteger.prototype.equals = bnEquals;
  BigInteger.prototype.min = bnMin;
  BigInteger.prototype.max = bnMax;
  BigInteger.prototype.and = bnAnd;
  BigInteger.prototype.or = bnOr;
  BigInteger.prototype.xor = bnXor;
  BigInteger.prototype.andNot = bnAndNot;
  BigInteger.prototype.not = bnNot;
  BigInteger.prototype.shiftLeft = bnShiftLeft;
  BigInteger.prototype.shiftRight = bnShiftRight;
  BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
  BigInteger.prototype.bitCount = bnBitCount;
  BigInteger.prototype.testBit = bnTestBit;
  BigInteger.prototype.setBit = bnSetBit;
  BigInteger.prototype.clearBit = bnClearBit;
  BigInteger.prototype.flipBit = bnFlipBit;
  BigInteger.prototype.add = bnAdd;
  BigInteger.prototype.subtract = bnSubtract;
  BigInteger.prototype.multiply = bnMultiply;
  BigInteger.prototype.divide = bnDivide;
  BigInteger.prototype.remainder = bnRemainder;
  BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
  BigInteger.prototype.modPow = bnModPow;
  BigInteger.prototype.modInverse = bnModInverse;
  BigInteger.prototype.pow = bnPow;
  BigInteger.prototype.gcd = bnGCD;
  BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

  // JSBN-specific extension
  BigInteger.prototype.square = bnSquare;

  // Expose the Barrett function
  BigInteger.prototype.Barrett = Barrett

  // BigInteger interfaces not implemented in jsbn:

  // BigInteger(int signum, byte[] magnitude)
  // double doubleValue()
  // float floatValue()
  // int hashCode()
  // long longValue()
  // static BigInteger valueOf(long val)

  // Random number generator - requires a PRNG backend, e.g. prng4.js

  // For best results, put code like
  // <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
  // in your main HTML document.

  var rng_state;
  var rng_pool;
  var rng_pptr;

  // Mix in a 32-bit integer into the pool
  function rng_seed_int(x) {
    rng_pool[rng_pptr++] ^= x & 255;
    rng_pool[rng_pptr++] ^= (x >> 8) & 255;
    rng_pool[rng_pptr++] ^= (x >> 16) & 255;
    rng_pool[rng_pptr++] ^= (x >> 24) & 255;
    if (rng_pptr >= rng_psize) rng_pptr -= rng_psize;
  }

  // Mix in the current time (w/milliseconds) into the pool
  function rng_seed_time() {
    rng_seed_int(new Date().getTime());
  }

  // Initialize the pool with junk if needed.
  if (rng_pool == null) {
    rng_pool = new Array();
    rng_pptr = 0;
    var t;
    if (typeof window !== "undefined" && window.crypto) {
      if (window.crypto.getRandomValues) {
        // Use webcrypto if available
        var ua = new Uint8Array(32);
        window.crypto.getRandomValues(ua);
        for (t = 0; t < 32; ++t)
          rng_pool[rng_pptr++] = ua[t];
      }
      else if (navigator.appName == "Netscape" && navigator.appVersion < "5") {
        // Extract entropy (256 bits) from NS4 RNG if available
        var z = window.crypto.random(32);
        for (t = 0; t < z.length; ++t)
          rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
      }
    }
    while (rng_pptr < rng_psize) {  // extract some randomness from Math.random()
      t = Math.floor(65536 * Math.random());
      rng_pool[rng_pptr++] = t >>> 8;
      rng_pool[rng_pptr++] = t & 255;
    }
    rng_pptr = 0;
    rng_seed_time();
    //rng_seed_int(window.screenX);
    //rng_seed_int(window.screenY);
  }

  function rng_get_byte() {
    if (rng_state == null) {
      rng_seed_time();
      rng_state = prng_newstate();
      rng_state.init(rng_pool);
      for (rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
        rng_pool[rng_pptr] = 0;
      rng_pptr = 0;
      //rng_pool = null;
    }
    // TODO: allow reseeding after first request
    return rng_state.next();
  }

  function rng_get_bytes(ba) {
    var i;
    for (i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
  }

  function SecureRandom() { }

  SecureRandom.prototype.nextBytes = rng_get_bytes;

  // prng4.js - uses Arcfour as a PRNG

  function Arcfour() {
    this.i = 0;
    this.j = 0;
    this.S = new Array();
  }

  // Initialize arcfour context from key, an array of ints, each from [0..255]
  function ARC4init(key) {
    var i, j, t;
    for (i = 0; i < 256; ++i)
      this.S[i] = i;
    j = 0;
    for (i = 0; i < 256; ++i) {
      j = (j + this.S[i] + key[i % key.length]) & 255;
      t = this.S[i];
      this.S[i] = this.S[j];
      this.S[j] = t;
    }
    this.i = 0;
    this.j = 0;
  }

  function ARC4next() {
    var t;
    this.i = (this.i + 1) & 255;
    this.j = (this.j + this.S[this.i]) & 255;
    t = this.S[this.i];
    this.S[this.i] = this.S[this.j];
    this.S[this.j] = t;
    return this.S[(t + this.S[this.i]) & 255];
  }

  Arcfour.prototype.init = ARC4init;
  Arcfour.prototype.next = ARC4next;

  // Plug in your RNG constructor here
  function prng_newstate() {
    return new Arcfour();
  }

  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to init()
  var rng_psize = 256;

  return {
    BigInteger: BigInteger,
    SecureRandom: SecureRandom
  };

}).call(this);

function calc_sha1(msg) {
   var md1 = forge.md.sha1.create();
   md1.update(msg);
   return md1.digest().toHex();
}

function calc_sha256(msg) {
   var md1 = forge.md.sha256.create();
   md1.update(msg);
   return md1.digest().toHex();
}


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.forge=t():e.forge=t()}(this,function(){return function(e){function t(a){if(r[a])return r[a].exports;var n=r[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var r={};return t.m=e,t.c=r,t.i=function(e){return e},t.d=function(e,r,a){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:a})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=42)}([function(e,t){e.exports={options:{usePureJavaScript:!1}}},function(e,t,r){function a(e){if(8!==e&&16!==e&&24!==e&&32!==e)throw new Error("Only 8, 16, 24, or 32 bits supported: "+e)}function n(e){if(this.data="",this.read=0,"string"==typeof e)this.data=e;else if(o.isArrayBuffer(e)||o.isArrayBufferView(e)){var t=new Uint8Array(e);try{this.data=String.fromCharCode.apply(null,t)}catch(e){for(var r=0;r<t.length;++r)this.putByte(t[r])}}else(e instanceof n||"object"==typeof e&&"string"==typeof e.data&&"number"==typeof e.read)&&(this.data=e.data,this.read=e.read);this._constructedStringLength=0}function i(e,t){t=t||{},this.read=t.readOffset||0,this.growSize=t.growSize||1024;var r=o.isArrayBuffer(e),a=o.isArrayBufferView(e);return r||a?(r?this.data=new DataView(e):this.data=new DataView(e.buffer,e.byteOffset,e.byteLength),void(this.write="writeOffset"in t?t.writeOffset:this.data.byteLength)):(this.data=new DataView(new ArrayBuffer(0)),this.write=0,null!==e&&void 0!==e&&this.putBytes(e),void("writeOffset"in t&&(this.write=t.writeOffset)))}var s=r(0),o=e.exports=s.util=s.util||{};!function(){function e(e){if(e.source===window&&e.data===t){e.stopPropagation();var a=r.slice();r.length=0,a.forEach(function(e){e()})}}if("undefined"!=typeof process&&process.nextTick)return o.nextTick=process.nextTick,void("function"==typeof setImmediate?o.setImmediate=setImmediate:o.setImmediate=o.nextTick);if("function"==typeof setImmediate)return o.setImmediate=function(){return setImmediate.apply(void 0,arguments)},void(o.nextTick=function(e){return setImmediate(e)});if(o.setImmediate=function(e){setTimeout(e,0)},"undefined"!=typeof window&&"function"==typeof window.postMessage){var t="forge.setImmediate",r=[];o.setImmediate=function(e){r.push(e),1===r.length&&window.postMessage(t,"*")},window.addEventListener("message",e,!0)}if("undefined"!=typeof MutationObserver){var a=Date.now(),n=!0,i=document.createElement("div"),r=[];new MutationObserver(function(){var e=r.slice();r.length=0,e.forEach(function(e){e()})}).observe(i,{attributes:!0});var s=o.setImmediate;o.setImmediate=function(e){Date.now()-a>15?(a=Date.now(),s(e)):(r.push(e),1===r.length&&i.setAttribute("a",n=!n))}}o.nextTick=o.setImmediate}(),o.isNodejs="undefined"!=typeof process&&process.versions&&process.versions.node,o.isArray=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},o.isArrayBuffer=function(e){return"undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer},o.isArrayBufferView=function(e){return e&&o.isArrayBuffer(e.buffer)&&void 0!==e.byteLength},o.ByteBuffer=n,o.ByteStringBuffer=n;var c=4096;o.ByteStringBuffer.prototype._optimizeConstructedString=function(e){this._constructedStringLength+=e,this._constructedStringLength>c&&(this.data.substr(0,1),this._constructedStringLength=0)},o.ByteStringBuffer.prototype.length=function(){return this.data.length-this.read},o.ByteStringBuffer.prototype.isEmpty=function(){return this.length()<=0},o.ByteStringBuffer.prototype.putByte=function(e){return this.putBytes(String.fromCharCode(e))},o.ByteStringBuffer.prototype.fillWithByte=function(e,t){e=String.fromCharCode(e);for(var r=this.data;t>0;)1&t&&(r+=e),t>>>=1,t>0&&(e+=e);return this.data=r,this._optimizeConstructedString(t),this},o.ByteStringBuffer.prototype.putBytes=function(e){return this.data+=e,this._optimizeConstructedString(e.length),this},o.ByteStringBuffer.prototype.putString=function(e){return this.putBytes(o.encodeUtf8(e))},o.ByteStringBuffer.prototype.putInt16=function(e){return this.putBytes(String.fromCharCode(e>>8&255)+String.fromCharCode(255&e))},o.ByteStringBuffer.prototype.putInt24=function(e){return this.putBytes(String.fromCharCode(e>>16&255)+String.fromCharCode(e>>8&255)+String.fromCharCode(255&e))},o.ByteStringBuffer.prototype.putInt32=function(e){return this.putBytes(String.fromCharCode(e>>24&255)+String.fromCharCode(e>>16&255)+String.fromCharCode(e>>8&255)+String.fromCharCode(255&e))},o.ByteStringBuffer.prototype.putInt16Le=function(e){return this.putBytes(String.fromCharCode(255&e)+String.fromCharCode(e>>8&255))},o.ByteStringBuffer.prototype.putInt24Le=function(e){return this.putBytes(String.fromCharCode(255&e)+String.fromCharCode(e>>8&255)+String.fromCharCode(e>>16&255))},o.ByteStringBuffer.prototype.putInt32Le=function(e){return this.putBytes(String.fromCharCode(255&e)+String.fromCharCode(e>>8&255)+String.fromCharCode(e>>16&255)+String.fromCharCode(e>>24&255))},o.ByteStringBuffer.prototype.putInt=function(e,t){a(t);var r="";do t-=8,r+=String.fromCharCode(e>>t&255);while(t>0);return this.putBytes(r)},o.ByteStringBuffer.prototype.putSignedInt=function(e,t){return e<0&&(e+=2<<t-1),this.putInt(e,t)},o.ByteStringBuffer.prototype.putBuffer=function(e){return this.putBytes(e.getBytes())},o.ByteStringBuffer.prototype.getByte=function(){return this.data.charCodeAt(this.read++)},o.ByteStringBuffer.prototype.getInt16=function(){var e=this.data.charCodeAt(this.read)<<8^this.data.charCodeAt(this.read+1);return this.read+=2,e},o.ByteStringBuffer.prototype.getInt24=function(){var e=this.data.charCodeAt(this.read)<<16^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2);return this.read+=3,e},o.ByteStringBuffer.prototype.getInt32=function(){var e=this.data.charCodeAt(this.read)<<24^this.data.charCodeAt(this.read+1)<<16^this.data.charCodeAt(this.read+2)<<8^this.data.charCodeAt(this.read+3);return this.read+=4,e},o.ByteStringBuffer.prototype.getInt16Le=function(){var e=this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8;return this.read+=2,e},o.ByteStringBuffer.prototype.getInt24Le=function(){var e=this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2)<<16;return this.read+=3,e},o.ByteStringBuffer.prototype.getInt32Le=function(){var e=this.data.charCodeAt(this.read)^this.data.charCodeAt(this.read+1)<<8^this.data.charCodeAt(this.read+2)<<16^this.data.charCodeAt(this.read+3)<<24;return this.read+=4,e},o.ByteStringBuffer.prototype.getInt=function(e){a(e);var t=0;do t=(t<<8)+this.data.charCodeAt(this.read++),e-=8;while(e>0);return t},o.ByteStringBuffer.prototype.getSignedInt=function(e){var t=this.getInt(e),r=2<<e-2;return t>=r&&(t-=r<<1),t},o.ByteStringBuffer.prototype.getBytes=function(e){var t;return e?(e=Math.min(this.length(),e),t=this.data.slice(this.read,this.read+e),this.read+=e):0===e?t="":(t=0===this.read?this.data:this.data.slice(this.read),this.clear()),t},o.ByteStringBuffer.prototype.bytes=function(e){return"undefined"==typeof e?this.data.slice(this.read):this.data.slice(this.read,this.read+e)},o.ByteStringBuffer.prototype.at=function(e){return this.data.charCodeAt(this.read+e)},o.ByteStringBuffer.prototype.setAt=function(e,t){return this.data=this.data.substr(0,this.read+e)+String.fromCharCode(t)+this.data.substr(this.read+e+1),this},o.ByteStringBuffer.prototype.last=function(){return this.data.charCodeAt(this.data.length-1)},o.ByteStringBuffer.prototype.copy=function(){var e=o.createBuffer(this.data);return e.read=this.read,e},o.ByteStringBuffer.prototype.compact=function(){return this.read>0&&(this.data=this.data.slice(this.read),this.read=0),this},o.ByteStringBuffer.prototype.clear=function(){return this.data="",this.read=0,this},o.ByteStringBuffer.prototype.truncate=function(e){var t=Math.max(0,this.length()-e);return this.data=this.data.substr(this.read,t),this.read=0,this},o.ByteStringBuffer.prototype.toHex=function(){for(var e="",t=this.read;t<this.data.length;++t){var r=this.data.charCodeAt(t);r<16&&(e+="0"),e+=r.toString(16)}return e},o.ByteStringBuffer.prototype.toString=function(){return o.decodeUtf8(this.bytes())},o.DataBuffer=i,o.DataBuffer.prototype.length=function(){return this.write-this.read},o.DataBuffer.prototype.isEmpty=function(){return this.length()<=0},o.DataBuffer.prototype.accommodate=function(e,t){if(this.length()>=e)return this;t=Math.max(t||this.growSize,e);var r=new Uint8Array(this.data.buffer,this.data.byteOffset,this.data.byteLength),a=new Uint8Array(this.length()+t);return a.set(r),this.data=new DataView(a.buffer),this},o.DataBuffer.prototype.putByte=function(e){return this.accommodate(1),this.data.setUint8(this.write++,e),this},o.DataBuffer.prototype.fillWithByte=function(e,t){this.accommodate(t);for(var r=0;r<t;++r)this.data.setUint8(e);return this},o.DataBuffer.prototype.putBytes=function(e,t){if(o.isArrayBufferView(e)){var r=new Uint8Array(e.buffer,e.byteOffset,e.byteLength),a=r.byteLength-r.byteOffset;this.accommodate(a);var n=new Uint8Array(this.data.buffer,this.write);return n.set(r),this.write+=a,this}if(o.isArrayBuffer(e)){var r=new Uint8Array(e);this.accommodate(r.byteLength);var n=new Uint8Array(this.data.buffer);return n.set(r,this.write),this.write+=r.byteLength,this}if(e instanceof o.DataBuffer||"object"==typeof e&&"number"==typeof e.read&&"number"==typeof e.write&&o.isArrayBufferView(e.data)){var r=new Uint8Array(e.data.byteLength,e.read,e.length());this.accommodate(r.byteLength);var n=new Uint8Array(e.data.byteLength,this.write);return n.set(r),this.write+=r.byteLength,this}if(e instanceof o.ByteStringBuffer&&(e=e.data,t="binary"),t=t||"binary","string"==typeof e){var i;if("hex"===t)return this.accommodate(Math.ceil(e.length/2)),i=new Uint8Array(this.data.buffer,this.write),this.write+=o.binary.hex.decode(e,i,this.write),this;if("base64"===t)return this.accommodate(3*Math.ceil(e.length/4)),i=new Uint8Array(this.data.buffer,this.write),this.write+=o.binary.base64.decode(e,i,this.write),this;if("utf8"===t&&(e=o.encodeUtf8(e),t="binary"),"binary"===t||"raw"===t)return this.accommodate(e.length),i=new Uint8Array(this.data.buffer,this.write),this.write+=o.binary.raw.decode(i),this;if("utf16"===t)return this.accommodate(2*e.length),i=new Uint16Array(this.data.buffer,this.write),this.write+=o.text.utf16.encode(i),this;throw new Error("Invalid encoding: "+t)}throw Error("Invalid parameter: "+e)},o.DataBuffer.prototype.putBuffer=function(e){return this.putBytes(e),e.clear(),this},o.DataBuffer.prototype.putString=function(e){return this.putBytes(e,"utf16")},o.DataBuffer.prototype.putInt16=function(e){return this.accommodate(2),this.data.setInt16(this.write,e),this.write+=2,this},o.DataBuffer.prototype.putInt24=function(e){return this.accommodate(3),this.data.setInt16(this.write,e>>8&65535),this.data.setInt8(this.write,e>>16&255),this.write+=3,this},o.DataBuffer.prototype.putInt32=function(e){return this.accommodate(4),this.data.setInt32(this.write,e),this.write+=4,this},o.DataBuffer.prototype.putInt16Le=function(e){return this.accommodate(2),this.data.setInt16(this.write,e,!0),this.write+=2,this},o.DataBuffer.prototype.putInt24Le=function(e){return this.accommodate(3),this.data.setInt8(this.write,e>>16&255),this.data.setInt16(this.write,e>>8&65535,!0),this.write+=3,this},o.DataBuffer.prototype.putInt32Le=function(e){return this.accommodate(4),this.data.setInt32(this.write,e,!0),this.write+=4,this},o.DataBuffer.prototype.putInt=function(e,t){a(t),this.accommodate(t/8);do t-=8,this.data.setInt8(this.write++,e>>t&255);while(t>0);return this},o.DataBuffer.prototype.putSignedInt=function(e,t){return a(t),this.accommodate(t/8),e<0&&(e+=2<<t-1),this.putInt(e,t)},o.DataBuffer.prototype.getByte=function(){return this.data.getInt8(this.read++)},o.DataBuffer.prototype.getInt16=function(){var e=this.data.getInt16(this.read);return this.read+=2,e},o.DataBuffer.prototype.getInt24=function(){var e=this.data.getInt16(this.read)<<8^this.data.getInt8(this.read+2);return this.read+=3,e},o.DataBuffer.prototype.getInt32=function(){var e=this.data.getInt32(this.read);return this.read+=4,e},o.DataBuffer.prototype.getInt16Le=function(){var e=this.data.getInt16(this.read,!0);return this.read+=2,e},o.DataBuffer.prototype.getInt24Le=function(){var e=this.data.getInt8(this.read)^this.data.getInt16(this.read+1,!0)<<8;return this.read+=3,e},o.DataBuffer.prototype.getInt32Le=function(){var e=this.data.getInt32(this.read,!0);return this.read+=4,e},o.DataBuffer.prototype.getInt=function(e){a(e);var t=0;do t=(t<<8)+this.data.getInt8(this.read++),e-=8;while(e>0);return t},o.DataBuffer.prototype.getSignedInt=function(e){var t=this.getInt(e),r=2<<e-2;return t>=r&&(t-=r<<1),t},o.DataBuffer.prototype.getBytes=function(e){var t;return e?(e=Math.min(this.length(),e),t=this.data.slice(this.read,this.read+e),this.read+=e):0===e?t="":(t=0===this.read?this.data:this.data.slice(this.read),this.clear()),t},o.DataBuffer.prototype.bytes=function(e){return"undefined"==typeof e?this.data.slice(this.read):this.data.slice(this.read,this.read+e)},o.DataBuffer.prototype.at=function(e){return this.data.getUint8(this.read+e)},o.DataBuffer.prototype.setAt=function(e,t){return this.data.setUint8(e,t),this},o.DataBuffer.prototype.last=function(){return this.data.getUint8(this.write-1)},o.DataBuffer.prototype.copy=function(){return new o.DataBuffer(this)},o.DataBuffer.prototype.compact=function(){if(this.read>0){var e=new Uint8Array(this.data.buffer,this.read),t=new Uint8Array(e.byteLength);t.set(e),this.data=new DataView(t),this.write-=this.read,this.read=0}return this},o.DataBuffer.prototype.clear=function(){return this.data=new DataView(new ArrayBuffer(0)),this.read=this.write=0,this},o.DataBuffer.prototype.truncate=function(e){return this.write=Math.max(0,this.length()-e),this.read=Math.min(this.read,this.write),this},o.DataBuffer.prototype.toHex=function(){for(var e="",t=this.read;t<this.data.byteLength;++t){var r=this.data.getUint8(t);r<16&&(e+="0"),e+=r.toString(16)}return e},o.DataBuffer.prototype.toString=function(e){var t=new Uint8Array(this.data,this.read,this.length());if(e=e||"utf8","binary"===e||"raw"===e)return o.binary.raw.encode(t);if("hex"===e)return o.binary.hex.encode(t);if("base64"===e)return o.binary.base64.encode(t);if("utf8"===e)return o.text.utf8.decode(t);if("utf16"===e)return o.text.utf16.decode(t);throw new Error("Invalid encoding: "+e)},o.createBuffer=function(e,t){return t=t||"raw",void 0!==e&&"utf8"===t&&(e=o.encodeUtf8(e)),new o.ByteBuffer(e)},o.fillString=function(e,t){for(var r="";t>0;)1&t&&(r+=e),t>>>=1,t>0&&(e+=e);return r},o.xorBytes=function(e,t,r){for(var a="",n="",i="",s=0,o=0;r>0;--r,++s)n=e.charCodeAt(s)^t.charCodeAt(s),o>=10&&(a+=i,i="",o=0),i+=String.fromCharCode(n),++o;return a+=i},o.hexToBytes=function(e){var t="",r=0;for(e.length&!0&&(r=1,t+=String.fromCharCode(parseInt(e[0],16)));r<e.length;r+=2)t+=String.fromCharCode(parseInt(e.substr(r,2),16));return t},o.bytesToHex=function(e){return o.createBuffer(e).toHex()},o.int32ToBytes=function(e){return String.fromCharCode(e>>24&255)+String.fromCharCode(e>>16&255)+String.fromCharCode(e>>8&255)+String.fromCharCode(255&e)};var u="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",l=[62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,64,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];o.encode64=function(e,t){for(var r,a,n,i="",s="",o=0;o<e.length;)r=e.charCodeAt(o++),a=e.charCodeAt(o++),n=e.charCodeAt(o++),i+=u.charAt(r>>2),i+=u.charAt((3&r)<<4|a>>4),isNaN(a)?i+="==":(i+=u.charAt((15&a)<<2|n>>6),i+=isNaN(n)?"=":u.charAt(63&n)),t&&i.length>t&&(s+=i.substr(0,t)+"\r\n",i=i.substr(t));return s+=i},o.decode64=function(e){e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");for(var t,r,a,n,i="",s=0;s<e.length;)t=l[e.charCodeAt(s++)-43],r=l[e.charCodeAt(s++)-43],a=l[e.charCodeAt(s++)-43],n=l[e.charCodeAt(s++)-43],i+=String.fromCharCode(t<<2|r>>4),64!==a&&(i+=String.fromCharCode((15&r)<<4|a>>2),64!==n&&(i+=String.fromCharCode((3&a)<<6|n)));return i},o.encodeUtf8=function(e){return unescape(encodeURIComponent(e))},o.decodeUtf8=function(e){return decodeURIComponent(escape(e))},o.binary={raw:{},hex:{},base64:{}},o.binary.raw.encode=function(e){return String.fromCharCode.apply(null,e)},o.binary.raw.decode=function(e,t,r){var a=t;a||(a=new Uint8Array(e.length)),r=r||0;for(var n=r,i=0;i<e.length;++i)a[n++]=e.charCodeAt(i);return t?n-r:a},o.binary.hex.encode=o.bytesToHex,o.binary.hex.decode=function(e,t,r){var a=t;a||(a=new Uint8Array(Math.ceil(e.length/2))),r=r||0;var n=0,i=r;for(1&e.length&&(n=1,a[i++]=parseInt(e[0],16));n<e.length;n+=2)a[i++]=parseInt(e.substr(n,2),16);return t?i-r:a},o.binary.base64.encode=function(e,t){for(var r,a,n,i="",s="",o=0;o<e.byteLength;)r=e[o++],a=e[o++],n=e[o++],i+=u.charAt(r>>2),i+=u.charAt((3&r)<<4|a>>4),isNaN(a)?i+="==":(i+=u.charAt((15&a)<<2|n>>6),i+=isNaN(n)?"=":u.charAt(63&n)),t&&i.length>t&&(s+=i.substr(0,t)+"\r\n",i=i.substr(t));return s+=i},o.binary.base64.decode=function(e,t,r){var a=t;a||(a=new Uint8Array(3*Math.ceil(e.length/4))),e=e.replace(/[^A-Za-z0-9\+\/\=]/g,""),r=r||0;for(var n,i,s,o,c=0,u=r;c<e.length;)n=l[e.charCodeAt(c++)-43],i=l[e.charCodeAt(c++)-43],s=l[e.charCodeAt(c++)-43],o=l[e.charCodeAt(c++)-43],a[u++]=n<<2|i>>4,64!==s&&(a[u++]=(15&i)<<4|s>>2,64!==o&&(a[u++]=(3&s)<<6|o));return t?u-r:a.subarray(0,u)},o.text={utf8:{},utf16:{}},o.text.utf8.encode=function(e,t,r){e=o.encodeUtf8(e);var a=t;a||(a=new Uint8Array(e.length)),r=r||0;for(var n=r,i=0;i<e.length;++i)a[n++]=e.charCodeAt(i);return t?n-r:a},o.text.utf8.decode=function(e){return o.decodeUtf8(String.fromCharCode.apply(null,e))},o.text.utf16.encode=function(e,t,r){var a=t;a||(a=new Uint8Array(2*e.length));var n=new Uint16Array(a.buffer);r=r||0;for(var i=r,s=r,o=0;o<e.length;++o)n[s++]=e.charCodeAt(o),i+=2;return t?i-r:a},o.text.utf16.decode=function(e){return String.fromCharCode.apply(null,new Uint16Array(e.buffer))},o.deflate=function(e,t,r){if(t=o.decode64(e.deflate(o.encode64(t)).rval),r){var a=2,n=t.charCodeAt(1);32&n&&(a=6),t=t.substring(a,t.length-4)}return t},o.inflate=function(e,t,r){var a=e.inflate(o.encode64(t)).rval;return null===a?null:o.decode64(a)};var p=function(e,t,r){if(!e)throw new Error("WebStorage not available.");var a;if(null===r?a=e.removeItem(t):(r=o.encode64(JSON.stringify(r)),a=e.setItem(t,r)),"undefined"!=typeof a&&a.rval!==!0){var n=new Error(a.error.message);throw n.id=a.error.id,n.name=a.error.name,n}},h=function(e,t){if(!e)throw new Error("WebStorage not available.");var r=e.getItem(t);if(e.init)if(null===r.rval){if(r.error){var a=new Error(r.error.message);throw a.id=r.error.id,a.name=r.error.name,a}r=null}else r=r.rval;return null!==r&&(r=JSON.parse(o.decode64(r))),r},f=function(e,t,r,a){var n=h(e,t);null===n&&(n={}),n[r]=a,p(e,t,n)},d=function(e,t,r){var a=h(e,t);return null!==a&&(a=r in a?a[r]:null),a},y=function(e,t,r){var a=h(e,t);if(null!==a&&r in a){delete a[r];var n=!0;for(var i in a){n=!1;break}n&&(a=null),p(e,t,a)}},g=function(e,t){p(e,t,null)},v=function(e,t,r){var a=null;"undefined"==typeof r&&(r=["web","flash"]);var n,i=!1,s=null;for(var o in r){n=r[o];try{if("flash"===n||"both"===n){if(null===t[0])throw new Error("Flash local storage not available.");a=e.apply(this,t),i="flash"===n}"web"!==n&&"both"!==n||(t[0]=localStorage,a=e.apply(this,t),i=!0)}catch(e){s=e}if(i)break}if(!i)throw s;return a};o.setItem=function(e,t,r,a,n){v(f,arguments,n)},o.getItem=function(e,t,r,a){return v(d,arguments,a)},o.removeItem=function(e,t,r,a){v(y,arguments,a)},o.clearItems=function(e,t,r){v(g,arguments,r)},o.parseUrl=function(e){var t=/^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g;t.lastIndex=0;var r=t.exec(e),a=null===r?null:{full:e,scheme:r[1],host:r[2],port:r[3],path:r[4]};return a&&(a.fullHost=a.host,a.port?80!==a.port&&"http"===a.scheme?a.fullHost+=":"+a.port:443!==a.port&&"https"===a.scheme&&(a.fullHost+=":"+a.port):"http"===a.scheme?a.port=80:"https"===a.scheme&&(a.port=443),a.full=a.scheme+"://"+a.fullHost),a};var m=null;o.getQueryVariables=function(e){var t,r=function(e){for(var t={},r=e.split("&"),a=0;a<r.length;a++){var n,i,s=r[a].indexOf("=");s>0?(n=r[a].substring(0,s),i=r[a].substring(s+1)):(n=r[a],i=null),n in t||(t[n]=[]),n in Object.prototype||null===i||t[n].push(unescape(i))}return t};return"undefined"==typeof e?(null===m&&(m="undefined"!=typeof window&&window.location&&window.location.search?r(window.location.search.substring(1)):{}),t=m):t=r(e),t},o.parseFragment=function(e){var t=e,r="",a=e.indexOf("?");a>0&&(t=e.substring(0,a),r=e.substring(a+1));var n=t.split("/");n.length>0&&""===n[0]&&n.shift();var i=""===r?{}:o.getQueryVariables(r);return{pathString:t,queryString:r,path:n,query:i}},o.makeRequest=function(e){var t=o.parseFragment(e),r={path:t.pathString,query:t.queryString,getPath:function(e){return"undefined"==typeof e?t.path:t.path[e]},getQuery:function(e,r){var a;return"undefined"==typeof e?a=t.query:(a=t.query[e],a&&"undefined"!=typeof r&&(a=a[r])),a},getQueryLast:function(e,t){var a,n=r.getQuery(e);return a=n?n[n.length-1]:t}};return r},o.makeLink=function(e,t,r){e=jQuery.isArray(e)?e.join("/"):e;var a=jQuery.param(t||{});return r=r||"",e+(a.length>0?"?"+a:"")+(r.length>0?"#"+r:"")},o.setPath=function(e,t,r){if("object"==typeof e&&null!==e)for(var a=0,n=t.length;a<n;){var i=t[a++];if(a==n)e[i]=r;else{var s=i in e;(!s||s&&"object"!=typeof e[i]||s&&null===e[i])&&(e[i]={}),e=e[i]}}},o.getPath=function(e,t,r){for(var a=0,n=t.length,i=!0;i&&a<n&&"object"==typeof e&&null!==e;){var s=t[a++];i=s in e,i&&(e=e[s])}return i?e:r},o.deletePath=function(e,t){if("object"==typeof e&&null!==e)for(var r=0,a=t.length;r<a;){var n=t[r++];if(r==a)delete e[n];else{if(!(n in e)||"object"!=typeof e[n]||null===e[n])break;e=e[n]}}},o.isEmpty=function(e){for(var t in e)if(e.hasOwnProperty(t))return!1;return!0},o.format=function(e){for(var t,r,a=/%./g,n=0,i=[],s=0;t=a.exec(e);){r=e.substring(s,a.lastIndex-2),r.length>0&&i.push(r),s=a.lastIndex;var o=t[0][1];switch(o){case"s":case"o":n<arguments.length?i.push(arguments[n++ +1]):i.push("<?>");break;case"%":i.push("%");break;default:i.push("<%"+o+"?>")}}return i.push(e.substring(s)),i.join("")},o.formatNumber=function(e,t,r,a){var n=e,i=isNaN(t=Math.abs(t))?2:t,s=void 0===r?",":r,o=void 0===a?".":a,c=n<0?"-":"",u=parseInt(n=Math.abs(+n||0).toFixed(i),10)+"",l=u.length>3?u.length%3:0;return c+(l?u.substr(0,l)+o:"")+u.substr(l).replace(/(\d{3})(?=\d)/g,"$1"+o)+(i?s+Math.abs(n-u).toFixed(i).slice(2):"")},o.formatSize=function(e){return e=e>=1073741824?o.formatNumber(e/1073741824,2,".","")+" GiB":e>=1048576?o.formatNumber(e/1048576,2,".","")+" MiB":e>=1024?o.formatNumber(e/1024,0)+" KiB":o.formatNumber(e,0)+" bytes"},o.bytesFromIP=function(e){return e.indexOf(".")!==-1?o.bytesFromIPv4(e):e.indexOf(":")!==-1?o.bytesFromIPv6(e):null},o.bytesFromIPv4=function(e){if(e=e.split("."),4!==e.length)return null;for(var t=o.createBuffer(),r=0;r<e.length;++r){var a=parseInt(e[r],10);if(isNaN(a))return null;t.putByte(a)}return t.getBytes()},o.bytesFromIPv6=function(e){var t=0;e=e.split(":").filter(function(e){return 0===e.length&&++t,!0});for(var r=2*(8-e.length+t),a=o.createBuffer(),n=0;n<8;++n)if(e[n]&&0!==e[n].length){var i=o.hexToBytes(e[n]);i.length<2&&a.putByte(0),a.putBytes(i)}else a.fillWithByte(0,r),r=0;return a.getBytes()},o.bytesToIP=function(e){return 4===e.length?o.bytesToIPv4(e):16===e.length?o.bytesToIPv6(e):null},o.bytesToIPv4=function(e){if(4!==e.length)return null;for(var t=[],r=0;r<e.length;++r)t.push(e.charCodeAt(r));return t.join(".")},o.bytesToIPv6=function(e){if(16!==e.length)return null;for(var t=[],r=[],a=0,n=0;n<e.length;n+=2){for(var i=o.bytesToHex(e[n]+e[n+1]);"0"===i[0]&&"0"!==i;)i=i.substr(1);if("0"===i){var s=r[r.length-1],c=t.length;s&&c===s.end+1?(s.end=c,s.end-s.start>r[a].end-r[a].start&&(a=r.length-1)):r.push({start:c,end:c})}t.push(i)}if(r.length>0){var u=r[a];u.end-u.start>0&&(t.splice(u.start,u.end-u.start+1,""),0===u.start&&t.unshift(""),7===u.end&&t.push(""))}return t.join(":")},o.estimateCores=function(e,t){function r(e,s,c){if(0===s){var u=Math.floor(e.reduce(function(e,t){return e+t},0)/e.length);return o.cores=Math.max(1,u),URL.revokeObjectURL(i),t(null,o.cores)}a(c,function(t,a){e.push(n(c,a)),r(e,s-1,c)})}function a(e,t){for(var r=[],a=[],n=0;n<e;++n){var s=new Worker(i);s.addEventListener("message",function(n){if(a.push(n.data),a.length===e){for(var i=0;i<e;++i)r[i].terminate();t(null,a)}}),r.push(s)}for(var n=0;n<e;++n)r[n].postMessage(n)}function n(e,t){for(var r=[],a=0;a<e;++a)for(var n=t[a],i=r[a]=[],s=0;s<e;++s)if(a!==s){var o=t[s];(n.st>o.st&&n.st<o.et||o.st>n.st&&o.st<n.et)&&i.push(s)}return r.reduce(function(e,t){return Math.max(e,t.length)},0)}if("function"==typeof e&&(t=e,e={}),e=e||{},"cores"in o&&!e.update)return t(null,o.cores);if("undefined"!=typeof navigator&&"hardwareConcurrency"in navigator&&navigator.hardwareConcurrency>0)return o.cores=navigator.hardwareConcurrency,t(null,o.cores);if("undefined"==typeof Worker)return o.cores=1,t(null,o.cores);if("undefined"==typeof Blob)return o.cores=2,t(null,o.cores);var i=URL.createObjectURL(new Blob(["(",function(){self.addEventListener("message",function(e){for(var t=Date.now(),r=t+4;Date.now()<r;);self.postMessage({st:t,et:r})})}.toString(),")()"],{type:"application/javascript"}));r([],5,16)}},function(e,t,r){var a=r(0);r(5),r(30),r(28),r(1),function(){return a.random&&a.random.getBytes?void(e.exports=a.random):void function(t){function r(){var e=a.prng.create(n);return e.getBytes=function(t,r){return e.generate(t,r)},e.getBytesSync=function(t){return e.generate(t)},e}var n={},i=new Array(4),s=a.util.createBuffer();n.formatKey=function(e){var t=a.util.createBuffer(e);return e=new Array(4),e[0]=t.getInt32(),e[1]=t.getInt32(),e[2]=t.getInt32(),e[3]=t.getInt32(),a.aes._expandKey(e,!1)},n.formatSeed=function(e){var t=a.util.createBuffer(e);return e=new Array(4),e[0]=t.getInt32(),e[1]=t.getInt32(),e[2]=t.getInt32(),e[3]=t.getInt32(),e},n.cipher=function(e,t){return a.aes._updateBlock(e,t,i,!1),s.putInt32(i[0]),s.putInt32(i[1]),s.putInt32(i[2]),s.putInt32(i[3]),s.getBytes()},n.increment=function(e){return++e[3],e},n.md=a.md.sha256;var o=r(),c=null;if("undefined"!=typeof window){var u=window.crypto||window.msCrypto;u&&u.getRandomValues&&(c=function(e){return u.getRandomValues(e)})}if(a.options.usePureJavaScript||!a.util.isNodejs&&!c){if("undefined"==typeof window||void 0===window.document,o.collectInt(+new Date,32),"undefined"!=typeof navigator){var l="";for(var p in navigator)try{"string"==typeof navigator[p]&&(l+=navigator[p])}catch(e){}o.collect(l),l=null}t&&(t().mousemove(function(e){o.collectInt(e.clientX,16),o.collectInt(e.clientY,16)}),t().keypress(function(e){o.collectInt(e.charCode,8)}))}if(a.random)for(var p in o)a.random[p]=o[p];else a.random=o;a.random.createInstance=r,e.exports=a.random}("undefined"!=typeof jQuery?jQuery:null)}()},function(e,t,r){function a(e,t,r){if(r>t){var a=new Error("Too few bytes to parse DER.");throw a.available=e.length(),a.remaining=t,a.requested=r,a}}function n(e,t,r,i){var c;a(e,t,2);var u=e.getByte();t--;var l=192&u,p=31&u;c=e.length();var h=o(e,t);if(t-=c-e.length(),void 0!==h&&h>t){if(i.strict){var f=new Error("Too few bytes to read ASN.1 value.");throw f.available=e.length(),f.remaining=t,f.requested=h,f}h=t}var d,y,g=32===(32&u);if(g)if(d=[],void 0===h)for(;;){if(a(e,t,2),e.bytes(2)===String.fromCharCode(0,0)){e.getBytes(2),t-=2;break}c=e.length(),d.push(n(e,t,r+1,i)),t-=c-e.length()}else for(;h>0;)c=e.length(),d.push(n(e,h,r+1,i)),t-=c-e.length(),h-=c-e.length();if(void 0===d&&l===s.Class.UNIVERSAL&&p===s.Type.BITSTRING&&(y=e.bytes(h)),void 0===d&&i.decodeBitStrings&&l===s.Class.UNIVERSAL&&p===s.Type.BITSTRING&&h>1){var v=e.read,m=t,C=0;if(p===s.Type.BITSTRING&&(a(e,t,1),C=e.getByte(),t--),0===C)try{c=e.length();var E={verbose:i.verbose,strict:!0,decodeBitStrings:!0},S=n(e,t,r+1,E),T=c-e.length();t-=T,p==s.Type.BITSTRING&&T++;var I=S.tagClass;T!==h||I!==s.Class.UNIVERSAL&&I!==s.Class.CONTEXT_SPECIFIC||(d=[S])}catch(e){}void 0===d&&(e.read=v,t=m)}if(void 0===d){if(void 0===h){if(i.strict)throw new Error("Non-constructed ASN.1 object of indefinite length.");h=t}if(p===s.Type.BMPSTRING)for(d="";h>0;h-=2)a(e,t,2),d+=String.fromCharCode(e.getInt16()),t-=2;else d=e.getBytes(h)}var A=void 0===y?null:{bitStringContents:y};return s.create(l,p,g,d,A)}var i=r(0);r(1),r(6);var s=e.exports=i.asn1=i.asn1||{};s.Class={UNIVERSAL:0,APPLICATION:64,CONTEXT_SPECIFIC:128,PRIVATE:192},s.Type={NONE:0,BOOLEAN:1,INTEGER:2,BITSTRING:3,OCTETSTRING:4,NULL:5,OID:6,ODESC:7,EXTERNAL:8,REAL:9,ENUMERATED:10,EMBEDDED:11,UTF8:12,ROID:13,SEQUENCE:16,SET:17,PRINTABLESTRING:19,IA5STRING:22,UTCTIME:23,GENERALIZEDTIME:24,BMPSTRING:30},s.create=function(e,t,r,a,n){if(i.util.isArray(a)){for(var o=[],c=0;c<a.length;++c)void 0!==a[c]&&o.push(a[c]);a=o}var u={tagClass:e,type:t,constructed:r,composed:r||i.util.isArray(a),value:a};return n&&"bitStringContents"in n&&(u.bitStringContents=n.bitStringContents,u.original=s.copy(u)),u},s.copy=function(e,t){var r;if(i.util.isArray(e)){r=[];for(var a=0;a<e.length;++a)r.push(s.copy(e[a],t));return r}return"string"==typeof e?e:(r={tagClass:e.tagClass,type:e.type,constructed:e.constructed,composed:e.composed,value:s.copy(e.value,t)},t&&!t.excludeBitStringContents&&(r.bitStringContents=e.bitStringContents),r)},s.equals=function(e,t,r){if(i.util.isArray(e)){if(!i.util.isArray(t))return!1;if(e.length!==t.length)return!1;for(var a=0;a<e.length;++a)return!!s.equals(e[a],t[a])}if(typeof e!=typeof t)return!1;if("string"==typeof e)return e===t;var n=e.tagClass===t.tagClass&&e.type===t.type&&e.constructed===t.constructed&&e.composed===t.composed&&s.equals(e.value,t.value);return r&&r.includeBitStringContents&&(n=n&&e.bitStringContents===t.bitStringContents),n},s.getBerValueLength=function(e){var t=e.getByte();if(128!==t){var r,a=128&t;return r=a?e.getInt((127&t)<<3):t}};var o=function(e,t){var r=e.getByte();if(t--,128!==r){var n,i=128&r;if(i){var s=127&r;a(e,t,s),n=e.getInt(s<<3)}else n=r;if(n<0)throw new Error("Negative length: "+n);return n}};s.fromDer=function(e,t){return void 0===t&&(t={strict:!0,decodeBitStrings:!0}),"boolean"==typeof t&&(t={strict:t,decodeBitStrings:!0}),"strict"in t||(t.strict=!0),"decodeBitStrings"in t||(t.decodeBitStrings=!0),"string"==typeof e&&(e=i.util.createBuffer(e)),n(e,e.length(),0,t)},s.toDer=function(e){var t=i.util.createBuffer(),r=e.tagClass|e.type,a=i.util.createBuffer(),n=!1;if("bitStringContents"in e&&(n=!0,e.original&&(n=s.equals(e,e.original))),n)a.putBytes(e.bitStringContents);else if(e.composed){e.constructed?r|=32:a.putByte(0);for(var o=0;o<e.value.length;++o)void 0!==e.value[o]&&a.putBuffer(s.toDer(e.value[o]))}else if(e.type===s.Type.BMPSTRING)for(var o=0;o<e.value.length;++o)a.putInt16(e.value.charCodeAt(o));else e.type===s.Type.INTEGER&&e.value.length>1&&(0===e.value.charCodeAt(0)&&0===(128&e.value.charCodeAt(1))||255===e.value.charCodeAt(0)&&128===(128&e.value.charCodeAt(1)))?a.putBytes(e.value.substr(1)):a.putBytes(e.value);if(t.putByte(r),a.length()<=127)t.putByte(127&a.length());else{var c=a.length(),u="";do u+=String.fromCharCode(255&c),c>>>=8;while(c>0);t.putByte(128|u.length);for(var o=u.length-1;o>=0;--o)t.putByte(u.charCodeAt(o))}return t.putBuffer(a),t},s.oidToDer=function(e){var t=e.split("."),r=i.util.createBuffer();r.putByte(40*parseInt(t[0],10)+parseInt(t[1],10));for(var a,n,s,o,c=2;c<t.length;++c){a=!0,n=[],s=parseInt(t[c],10);do o=127&s,s>>>=7,a||(o|=128),n.push(o),a=!1;while(s>0);for(var u=n.length-1;u>=0;--u)r.putByte(n[u])}return r},s.derToOid=function(e){var t;"string"==typeof e&&(e=i.util.createBuffer(e));var r=e.getByte();t=Math.floor(r/40)+"."+r%40;for(var a=0;e.length()>0;)r=e.getByte(),
a<<=7,128&r?a+=127&r:(t+="."+(a+r),a=0);return t},s.utcTimeToDate=function(e){var t=new Date,r=parseInt(e.substr(0,2),10);r=r>=50?1900+r:2e3+r;var a=parseInt(e.substr(2,2),10)-1,n=parseInt(e.substr(4,2),10),i=parseInt(e.substr(6,2),10),s=parseInt(e.substr(8,2),10),o=0;if(e.length>11){var c=e.charAt(10),u=10;"+"!==c&&"-"!==c&&(o=parseInt(e.substr(10,2),10),u+=2)}if(t.setUTCFullYear(r,a,n),t.setUTCHours(i,s,o,0),u&&(c=e.charAt(u),"+"===c||"-"===c)){var l=parseInt(e.substr(u+1,2),10),p=parseInt(e.substr(u+4,2),10),h=60*l+p;h*=6e4,"+"===c?t.setTime(+t-h):t.setTime(+t+h)}return t},s.generalizedTimeToDate=function(e){var t=new Date,r=parseInt(e.substr(0,4),10),a=parseInt(e.substr(4,2),10)-1,n=parseInt(e.substr(6,2),10),i=parseInt(e.substr(8,2),10),s=parseInt(e.substr(10,2),10),o=parseInt(e.substr(12,2),10),c=0,u=0,l=!1;"Z"===e.charAt(e.length-1)&&(l=!0);var p=e.length-5,h=e.charAt(p);if("+"===h||"-"===h){var f=parseInt(e.substr(p+1,2),10),d=parseInt(e.substr(p+4,2),10);u=60*f+d,u*=6e4,"+"===h&&(u*=-1),l=!0}return"."===e.charAt(14)&&(c=1e3*parseFloat(e.substr(14),10)),l?(t.setUTCFullYear(r,a,n),t.setUTCHours(i,s,o,c),t.setTime(+t+u)):(t.setFullYear(r,a,n),t.setHours(i,s,o,c)),t},s.dateToUtcTime=function(e){if("string"==typeof e)return e;var t="",r=[];r.push((""+e.getUTCFullYear()).substr(2)),r.push(""+(e.getUTCMonth()+1)),r.push(""+e.getUTCDate()),r.push(""+e.getUTCHours()),r.push(""+e.getUTCMinutes()),r.push(""+e.getUTCSeconds());for(var a=0;a<r.length;++a)r[a].length<2&&(t+="0"),t+=r[a];return t+="Z"},s.dateToGeneralizedTime=function(e){if("string"==typeof e)return e;var t="",r=[];r.push(""+e.getUTCFullYear()),r.push(""+(e.getUTCMonth()+1)),r.push(""+e.getUTCDate()),r.push(""+e.getUTCHours()),r.push(""+e.getUTCMinutes()),r.push(""+e.getUTCSeconds());for(var a=0;a<r.length;++a)r[a].length<2&&(t+="0"),t+=r[a];return t+="Z"},s.integerToDer=function(e){var t=i.util.createBuffer();if(e>=-128&&e<128)return t.putSignedInt(e,8);if(e>=-32768&&e<32768)return t.putSignedInt(e,16);if(e>=-8388608&&e<8388608)return t.putSignedInt(e,24);if(e>=-2147483648&&e<2147483648)return t.putSignedInt(e,32);var r=new Error("Integer too large; max is 32-bits.");throw r.integer=e,r},s.derToInteger=function(e){"string"==typeof e&&(e=i.util.createBuffer(e));var t=8*e.length();if(t>32)throw new Error("Integer too large; max is 32-bits.");return e.getSignedInt(t)},s.validate=function(e,t,r,a){var n=!1;if(e.tagClass!==t.tagClass&&"undefined"!=typeof t.tagClass||e.type!==t.type&&"undefined"!=typeof t.type)a&&(e.tagClass!==t.tagClass&&a.push("["+t.name+'] Expected tag class "'+t.tagClass+'", got "'+e.tagClass+'"'),e.type!==t.type&&a.push("["+t.name+'] Expected type "'+t.type+'", got "'+e.type+'"'));else if(e.constructed===t.constructed||"undefined"==typeof t.constructed){if(n=!0,t.value&&i.util.isArray(t.value))for(var o=0,c=0;n&&c<t.value.length;++c)n=t.value[c].optional||!1,e.value[o]&&(n=s.validate(e.value[o],t.value[c],r,a),n?++o:t.value[c].optional&&(n=!0)),!n&&a&&a.push("["+t.name+'] Tag class "'+t.tagClass+'", type "'+t.type+'" expected value length "'+t.value.length+'", got "'+e.value.length+'"');if(n&&r&&(t.capture&&(r[t.capture]=e.value),t.captureAsn1&&(r[t.captureAsn1]=e),t.captureBitStringContents&&"bitStringContents"in e&&(r[t.captureBitStringContents]=e.bitStringContents),t.captureBitStringValue&&"bitStringContents"in e)){if(e.bitStringContents.length<2)r[t.captureBitStringValue]="";else{var u=e.bitStringContents.charCodeAt(0);if(0!==u)throw new Error("captureBitStringValue only supported for zero unused bits");r[t.captureBitStringValue]=e.bitStringContents.slice(1)}}}else a&&a.push("["+t.name+'] Expected constructed "'+t.constructed+'", got "'+e.constructed+'"');return n};var c=/[^\\u0000-\\u00ff]/;s.prettyPrint=function(e,t,r){var a="";t=t||0,r=r||2,t>0&&(a+="\n");for(var n="",o=0;o<t*r;++o)n+=" ";switch(a+=n+"Tag: ",e.tagClass){case s.Class.UNIVERSAL:a+="Universal:";break;case s.Class.APPLICATION:a+="Application:";break;case s.Class.CONTEXT_SPECIFIC:a+="Context-Specific:";break;case s.Class.PRIVATE:a+="Private:"}if(e.tagClass===s.Class.UNIVERSAL)switch(a+=e.type,e.type){case s.Type.NONE:a+=" (None)";break;case s.Type.BOOLEAN:a+=" (Boolean)";break;case s.Type.INTEGER:a+=" (Integer)";break;case s.Type.BITSTRING:a+=" (Bit string)";break;case s.Type.OCTETSTRING:a+=" (Octet string)";break;case s.Type.NULL:a+=" (Null)";break;case s.Type.OID:a+=" (Object Identifier)";break;case s.Type.ODESC:a+=" (Object Descriptor)";break;case s.Type.EXTERNAL:a+=" (External or Instance of)";break;case s.Type.REAL:a+=" (Real)";break;case s.Type.ENUMERATED:a+=" (Enumerated)";break;case s.Type.EMBEDDED:a+=" (Embedded PDV)";break;case s.Type.UTF8:a+=" (UTF8)";break;case s.Type.ROID:a+=" (Relative Object Identifier)";break;case s.Type.SEQUENCE:a+=" (Sequence)";break;case s.Type.SET:a+=" (Set)";break;case s.Type.PRINTABLESTRING:a+=" (Printable String)";break;case s.Type.IA5String:a+=" (IA5String (ASCII))";break;case s.Type.UTCTIME:a+=" (UTC time)";break;case s.Type.GENERALIZEDTIME:a+=" (Generalized time)";break;case s.Type.BMPSTRING:a+=" (BMP String)"}else a+=e.type;if(a+="\n",a+=n+"Constructed: "+e.constructed+"\n",e.composed){for(var u=0,l="",o=0;o<e.value.length;++o)void 0!==e.value[o]&&(u+=1,l+=s.prettyPrint(e.value[o],t+1,r),o+1<e.value.length&&(l+=","));a+=n+"Sub values: "+u+l}else{if(a+=n+"Value: ",e.type===s.Type.OID){var p=s.derToOid(e.value);a+=p,i.pki&&i.pki.oids&&p in i.pki.oids&&(a+=" ("+i.pki.oids[p]+") ")}if(e.type===s.Type.INTEGER)try{a+=s.derToInteger(e.value)}catch(t){a+="0x"+i.util.bytesToHex(e.value)}else if(e.type===s.Type.BITSTRING){if(a+=e.value.length>1?"0x"+i.util.bytesToHex(e.value.slice(1)):"(none)",e.value.length>0){var h=e.value.charCodeAt(0);1==h?a+=" (1 unused bit shown)":h>1&&(a+=" ("+h+" unused bits shown)")}}else e.type===s.Type.OCTETSTRING?(c.test(e.value)||(a+="("+e.value+") "),a+="0x"+i.util.bytesToHex(e.value)):a+=e.type===s.Type.UTF8?i.util.decodeUtf8(e.value):e.type===s.Type.PRINTABLESTRING||e.type===s.Type.IA5String?e.value:c.test(e.value)?"0x"+i.util.bytesToHex(e.value):0===e.value.length?"[null]":e.value}return a}},function(e,t,r){var a=r(0);e.exports=a.md=a.md||{},a.md.algorithms=a.md.algorithms||{}},function(e,t,r){function a(e,t){var r=function(){return new c.aes.Algorithm(e,t)};c.cipher.registerAlgorithm(e,r)}function n(){d=!0,p=[0,1,2,4,8,16,32,64,128,27,54];for(var e=new Array(256),t=0;t<128;++t)e[t]=t<<1,e[t+128]=t+128<<1^283;u=new Array(256),l=new Array(256),h=new Array(4),f=new Array(4);for(var t=0;t<4;++t)h[t]=new Array(256),f[t]=new Array(256);for(var r,a,n,i,s,o,c,y=0,g=0,t=0;t<256;++t){i=g^g<<1^g<<2^g<<3^g<<4,i=i>>8^255&i^99,u[y]=i,l[i]=y,s=e[i],r=e[y],a=e[r],n=e[a],o=s<<24^i<<16^i<<8^(i^s),c=(r^a^n)<<24^(y^n)<<16^(y^a^n)<<8^(y^r^n);for(var v=0;v<4;++v)h[v][y]=o,f[v][i]=c,o=o<<24|o>>>8,c=c<<24|c>>>8;0===y?y=g=1:(y=r^e[e[e[r^n]]],g^=e[e[g]])}}function i(e,t){for(var r,a=e.slice(0),n=1,i=a.length,s=i+6+1,o=y*s,c=i;c<o;++c)r=a[c-1],c%i===0?(r=u[r>>>16&255]<<24^u[r>>>8&255]<<16^u[255&r]<<8^u[r>>>24]^p[n]<<24,n++):i>6&&c%i===4&&(r=u[r>>>24]<<24^u[r>>>16&255]<<16^u[r>>>8&255]<<8^u[255&r]),a[c]=a[c-i]^r;if(t){var l,h=f[0],d=f[1],g=f[2],v=f[3],m=a.slice(0);o=a.length;for(var c=0,C=o-y;c<o;c+=y,C-=y)if(0===c||c===o-y)m[c]=a[C],m[c+1]=a[C+3],m[c+2]=a[C+2],m[c+3]=a[C+1];else for(var E=0;E<y;++E)l=a[C+E],m[c+(3&-E)]=h[u[l>>>24]]^d[u[l>>>16&255]]^g[u[l>>>8&255]]^v[u[255&l]];a=m}return a}function s(e,t,r,a){var n,i,s,o,c,p=e.length/4-1;a?(n=f[0],i=f[1],s=f[2],o=f[3],c=l):(n=h[0],i=h[1],s=h[2],o=h[3],c=u);var d,y,g,v,m,C,E;d=t[0]^e[0],y=t[a?3:1]^e[1],g=t[2]^e[2],v=t[a?1:3]^e[3];for(var S=3,T=1;T<p;++T)m=n[d>>>24]^i[y>>>16&255]^s[g>>>8&255]^o[255&v]^e[++S],C=n[y>>>24]^i[g>>>16&255]^s[v>>>8&255]^o[255&d]^e[++S],E=n[g>>>24]^i[v>>>16&255]^s[d>>>8&255]^o[255&y]^e[++S],v=n[v>>>24]^i[d>>>16&255]^s[y>>>8&255]^o[255&g]^e[++S],d=m,y=C,g=E;r[0]=c[d>>>24]<<24^c[y>>>16&255]<<16^c[g>>>8&255]<<8^c[255&v]^e[++S],r[a?3:1]=c[y>>>24]<<24^c[g>>>16&255]<<16^c[v>>>8&255]<<8^c[255&d]^e[++S],r[2]=c[g>>>24]<<24^c[v>>>16&255]<<16^c[d>>>8&255]<<8^c[255&y]^e[++S],r[a?1:3]=c[v>>>24]<<24^c[d>>>16&255]<<16^c[y>>>8&255]<<8^c[255&g]^e[++S]}function o(e){e=e||{};var t,r=(e.mode||"CBC").toUpperCase(),a="AES-"+r;t=e.decrypt?c.cipher.createDecipher(a,e.key):c.cipher.createCipher(a,e.key);var n=t.start;return t.start=function(e,r){var a=null;r instanceof c.util.ByteBuffer&&(a=r,r={}),r=r||{},r.output=a,r.iv=e,n.call(t,r)},t}var c=r(0);r(12),r(18),r(1),e.exports=c.aes=c.aes||{},c.aes.startEncrypting=function(e,t,r,a){var n=o({key:e,output:r,decrypt:!1,mode:a});return n.start(t),n},c.aes.createEncryptionCipher=function(e,t){return o({key:e,output:null,decrypt:!1,mode:t})},c.aes.startDecrypting=function(e,t,r,a){var n=o({key:e,output:r,decrypt:!0,mode:a});return n.start(t),n},c.aes.createDecryptionCipher=function(e,t){return o({key:e,output:null,decrypt:!0,mode:t})},c.aes.Algorithm=function(e,t){d||n();var r=this;r.name=e,r.mode=new t({blockSize:16,cipher:{encrypt:function(e,t){return s(r._w,e,t,!1)},decrypt:function(e,t){return s(r._w,e,t,!0)}}}),r._init=!1},c.aes.Algorithm.prototype.initialize=function(e){if(!this._init){var t,r=e.key;if("string"!=typeof r||16!==r.length&&24!==r.length&&32!==r.length){if(c.util.isArray(r)&&(16===r.length||24===r.length||32===r.length)){t=r,r=c.util.createBuffer();for(var a=0;a<t.length;++a)r.putByte(t[a])}}else r=c.util.createBuffer(r);if(!c.util.isArray(r)){t=r,r=[];var n=t.length();if(16===n||24===n||32===n){n>>>=2;for(var a=0;a<n;++a)r.push(t.getInt32())}}if(!c.util.isArray(r)||4!==r.length&&6!==r.length&&8!==r.length)throw new Error("Invalid key parameter.");var s=this.mode.name,o=["CFB","OFB","CTR","GCM"].indexOf(s)!==-1;this._w=i(r,e.decrypt&&!o),this._init=!0}},c.aes._expandKey=function(e,t){return d||n(),i(e,t)},c.aes._updateBlock=s,a("AES-ECB",c.cipher.modes.ecb),a("AES-CBC",c.cipher.modes.cbc),a("AES-CFB",c.cipher.modes.cfb),a("AES-OFB",c.cipher.modes.ofb),a("AES-CTR",c.cipher.modes.ctr),a("AES-GCM",c.cipher.modes.gcm);var u,l,p,h,f,d=!1,y=4},function(e,t,r){function a(e,t){s[e]=t,s[t]=e}function n(e,t){s[e]=t}var i=r(0);i.pki=i.pki||{};var s=e.exports=i.pki.oids=i.oids=i.oids||{};a("1.2.840.113549.1.1.1","rsaEncryption"),a("1.2.840.113549.1.1.4","md5WithRSAEncryption"),a("1.2.840.113549.1.1.5","sha1WithRSAEncryption"),a("1.2.840.113549.1.1.7","RSAES-OAEP"),a("1.2.840.113549.1.1.8","mgf1"),a("1.2.840.113549.1.1.9","pSpecified"),a("1.2.840.113549.1.1.10","RSASSA-PSS"),a("1.2.840.113549.1.1.11","sha256WithRSAEncryption"),a("1.2.840.113549.1.1.12","sha384WithRSAEncryption"),a("1.2.840.113549.1.1.13","sha512WithRSAEncryption"),a("1.3.14.3.2.7","desCBC"),a("1.3.14.3.2.26","sha1"),a("2.16.840.1.101.3.4.2.1","sha256"),a("2.16.840.1.101.3.4.2.2","sha384"),a("2.16.840.1.101.3.4.2.3","sha512"),a("1.2.840.113549.2.5","md5"),a("1.2.840.113549.1.7.1","data"),a("1.2.840.113549.1.7.2","signedData"),a("1.2.840.113549.1.7.3","envelopedData"),a("1.2.840.113549.1.7.4","signedAndEnvelopedData"),a("1.2.840.113549.1.7.5","digestedData"),a("1.2.840.113549.1.7.6","encryptedData"),a("1.2.840.113549.1.9.1","emailAddress"),a("1.2.840.113549.1.9.2","unstructuredName"),a("1.2.840.113549.1.9.3","contentType"),a("1.2.840.113549.1.9.4","messageDigest"),a("1.2.840.113549.1.9.5","signingTime"),a("1.2.840.113549.1.9.6","counterSignature"),a("1.2.840.113549.1.9.7","challengePassword"),a("1.2.840.113549.1.9.8","unstructuredAddress"),a("1.2.840.113549.1.9.14","extensionRequest"),a("1.2.840.113549.1.9.20","friendlyName"),a("1.2.840.113549.1.9.21","localKeyId"),a("1.2.840.113549.1.9.22.1","x509Certificate"),a("1.2.840.113549.1.12.10.1.1","keyBag"),a("1.2.840.113549.1.12.10.1.2","pkcs8ShroudedKeyBag"),a("1.2.840.113549.1.12.10.1.3","certBag"),a("1.2.840.113549.1.12.10.1.4","crlBag"),a("1.2.840.113549.1.12.10.1.5","secretBag"),a("1.2.840.113549.1.12.10.1.6","safeContentsBag"),a("1.2.840.113549.1.5.13","pkcs5PBES2"),a("1.2.840.113549.1.5.12","pkcs5PBKDF2"),a("1.2.840.113549.1.12.1.1","pbeWithSHAAnd128BitRC4"),a("1.2.840.113549.1.12.1.2","pbeWithSHAAnd40BitRC4"),a("1.2.840.113549.1.12.1.3","pbeWithSHAAnd3-KeyTripleDES-CBC"),a("1.2.840.113549.1.12.1.4","pbeWithSHAAnd2-KeyTripleDES-CBC"),a("1.2.840.113549.1.12.1.5","pbeWithSHAAnd128BitRC2-CBC"),a("1.2.840.113549.1.12.1.6","pbewithSHAAnd40BitRC2-CBC"),a("1.2.840.113549.2.7","hmacWithSHA1"),a("1.2.840.113549.2.8","hmacWithSHA224"),a("1.2.840.113549.2.9","hmacWithSHA256"),a("1.2.840.113549.2.10","hmacWithSHA384"),a("1.2.840.113549.2.11","hmacWithSHA512"),a("1.2.840.113549.3.7","des-EDE3-CBC"),a("2.16.840.1.101.3.4.1.2","aes128-CBC"),a("2.16.840.1.101.3.4.1.22","aes192-CBC"),a("2.16.840.1.101.3.4.1.42","aes256-CBC"),a("2.5.4.3","commonName"),a("2.5.4.5","serialName"),a("2.5.4.6","countryName"),a("2.5.4.7","localityName"),a("2.5.4.8","stateOrProvinceName"),a("2.5.4.10","organizationName"),a("2.5.4.11","organizationalUnitName"),a("2.16.840.1.113730.1.1","nsCertType"),n("2.5.29.1","authorityKeyIdentifier"),n("2.5.29.2","keyAttributes"),n("2.5.29.3","certificatePolicies"),n("2.5.29.4","keyUsageRestriction"),n("2.5.29.5","policyMapping"),n("2.5.29.6","subtreesConstraint"),n("2.5.29.7","subjectAltName"),n("2.5.29.8","issuerAltName"),n("2.5.29.9","subjectDirectoryAttributes"),n("2.5.29.10","basicConstraints"),n("2.5.29.11","nameConstraints"),n("2.5.29.12","policyConstraints"),n("2.5.29.13","basicConstraints"),a("2.5.29.14","subjectKeyIdentifier"),a("2.5.29.15","keyUsage"),n("2.5.29.16","privateKeyUsagePeriod"),a("2.5.29.17","subjectAltName"),a("2.5.29.18","issuerAltName"),a("2.5.29.19","basicConstraints"),n("2.5.29.20","cRLNumber"),n("2.5.29.21","cRLReason"),n("2.5.29.22","expirationDate"),n("2.5.29.23","instructionCode"),n("2.5.29.24","invalidityDate"),n("2.5.29.25","cRLDistributionPoints"),n("2.5.29.26","issuingDistributionPoint"),n("2.5.29.27","deltaCRLIndicator"),n("2.5.29.28","issuingDistributionPoint"),n("2.5.29.29","certificateIssuer"),n("2.5.29.30","nameConstraints"),a("2.5.29.31","cRLDistributionPoints"),a("2.5.29.32","certificatePolicies"),n("2.5.29.33","policyMappings"),n("2.5.29.34","policyConstraints"),a("2.5.29.35","authorityKeyIdentifier"),n("2.5.29.36","policyConstraints"),a("2.5.29.37","extKeyUsage"),n("2.5.29.46","freshestCRL"),n("2.5.29.54","inhibitAnyPolicy"),a("1.3.6.1.4.1.11129.2.4.2","timestampList"),a("1.3.6.1.5.5.7.1.1","authorityInfoAccess"),a("1.3.6.1.5.5.7.3.1","serverAuth"),a("1.3.6.1.5.5.7.3.2","clientAuth"),a("1.3.6.1.5.5.7.3.3","codeSigning"),a("1.3.6.1.5.5.7.3.4","emailProtection"),a("1.3.6.1.5.5.7.3.8","timeStamping")},function(e,t,r){function a(e){for(var t=e.name+": ",r=[],a=function(e,t){return" "+t},n=0;n<e.values.length;++n)r.push(e.values[n].replace(/^(\S+\r\n)/,a));t+=r.join(",")+"\r\n";for(var i=0,s=-1,n=0;n<t.length;++n,++i)if(i>65&&s!==-1){var o=t[s];","===o?(++s,t=t.substr(0,s)+"\r\n "+t.substr(s)):t=t.substr(0,s)+"\r\n"+o+t.substr(s+1),i=n-s-1,s=-1,++n}else" "!==t[n]&&"\t"!==t[n]&&","!==t[n]||(s=n);return t}function n(e){return e.replace(/^\s+/,"")}var i=r(0);r(1);var s=e.exports=i.pem=i.pem||{};s.encode=function(e,t){t=t||{};var r,n="-----BEGIN "+e.type+"-----\r\n";if(e.procType&&(r={name:"Proc-Type",values:[String(e.procType.version),e.procType.type]},n+=a(r)),e.contentDomain&&(r={name:"Content-Domain",values:[e.contentDomain]},n+=a(r)),e.dekInfo&&(r={name:"DEK-Info",values:[e.dekInfo.algorithm]},e.dekInfo.parameters&&r.values.push(e.dekInfo.parameters),n+=a(r)),e.headers)for(var s=0;s<e.headers.length;++s)n+=a(e.headers[s]);return e.procType&&(n+="\r\n"),n+=i.util.encode64(e.body,t.maxline||64)+"\r\n",n+="-----END "+e.type+"-----\r\n"},s.decode=function(e){for(var t,r=[],a=/\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g,s=/([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/,o=/\r?\n/;;){if(t=a.exec(e),!t)break;var c={type:t[1],procType:null,contentDomain:null,dekInfo:null,headers:[],body:i.util.decode64(t[3])};if(r.push(c),t[2]){for(var u=t[2].split(o),l=0;t&&l<u.length;){for(var p=u[l].replace(/\s+$/,""),h=l+1;h<u.length;++h){var f=u[h];if(!/\s/.test(f[0]))break;p+=f,l=h}if(t=p.match(s)){for(var d={name:t[1],values:[]},y=t[2].split(","),g=0;g<y.length;++g)d.values.push(n(y[g]));if(c.procType)if(c.contentDomain||"Content-Domain"!==d.name)if(c.dekInfo||"DEK-Info"!==d.name)c.headers.push(d);else{if(0===d.values.length)throw new Error('Invalid PEM formatted message. The "DEK-Info" header must have at least one subfield.');c.dekInfo={algorithm:y[0],parameters:y[1]||null}}else c.contentDomain=y[0]||"";else{if("Proc-Type"!==d.name)throw new Error('Invalid PEM formatted message. The first encapsulated header must be "Proc-Type".');if(2!==d.values.length)throw new Error('Invalid PEM formatted message. The "Proc-Type" header must have two subfields.');c.procType={version:y[0],type:y[1]}}}++l}if("ENCRYPTED"===c.procType&&!c.dekInfo)throw new Error('Invalid PEM formatted message. The "DEK-Info" header must be present if "Proc-Type" is "ENCRYPTED".')}}if(0===r.length)throw new Error("Invalid PEM formatted message.");return r}},function(e,t,r){var a=r(0);r(4),r(1);var n=e.exports=a.hmac=a.hmac||{};n.create=function(){var e=null,t=null,r=null,n=null,i={};return i.start=function(i,s){if(null!==i)if("string"==typeof i){if(i=i.toLowerCase(),!(i in a.md.algorithms))throw new Error('Unknown hash algorithm "'+i+'"');t=a.md.algorithms[i].create()}else t=i;if(null===s)s=e;else{if("string"==typeof s)s=a.util.createBuffer(s);else if(a.util.isArray(s)){var o=s;s=a.util.createBuffer();for(var c=0;c<o.length;++c)s.putByte(o[c])}var u=s.length();u>t.blockLength&&(t.start(),t.update(s.bytes()),s=t.digest()),r=a.util.createBuffer(),n=a.util.createBuffer(),u=s.length();for(var c=0;c<u;++c){var o=s.at(c);r.putByte(54^o),n.putByte(92^o)}if(u<t.blockLength)for(var o=t.blockLength-u,c=0;c<o;++c)r.putByte(54),n.putByte(92);e=s,r=r.bytes(),n=n.bytes()}t.start(),t.update(r)},i.update=function(e){t.update(e)},i.getMac=function(){var e=t.digest().bytes();return t.start(),t.update(n),t.update(e),t.digest()},i.digest=i.getMac,i}},function(e,t,r){function a(){o=String.fromCharCode(128),o+=i.util.fillString(String.fromCharCode(0),64),c=!0}function n(e,t,r){for(var a,n,i,s,o,c,u,l,p=r.length();p>=64;){for(n=e.h0,i=e.h1,s=e.h2,o=e.h3,c=e.h4,l=0;l<16;++l)a=r.getInt32(),t[l]=a,u=o^i&(s^o),a=(n<<5|n>>>27)+u+c+1518500249+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;for(;l<20;++l)a=t[l-3]^t[l-8]^t[l-14]^t[l-16],a=a<<1|a>>>31,t[l]=a,u=o^i&(s^o),a=(n<<5|n>>>27)+u+c+1518500249+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;for(;l<32;++l)a=t[l-3]^t[l-8]^t[l-14]^t[l-16],a=a<<1|a>>>31,t[l]=a,u=i^s^o,a=(n<<5|n>>>27)+u+c+1859775393+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;for(;l<40;++l)a=t[l-6]^t[l-16]^t[l-28]^t[l-32],a=a<<2|a>>>30,t[l]=a,u=i^s^o,a=(n<<5|n>>>27)+u+c+1859775393+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;for(;l<60;++l)a=t[l-6]^t[l-16]^t[l-28]^t[l-32],a=a<<2|a>>>30,t[l]=a,u=i&s|o&(i^s),a=(n<<5|n>>>27)+u+c+2400959708+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;for(;l<80;++l)a=t[l-6]^t[l-16]^t[l-28]^t[l-32],a=a<<2|a>>>30,t[l]=a,u=i^s^o,a=(n<<5|n>>>27)+u+c+3395469782+a,c=o,o=s,s=(i<<30|i>>>2)>>>0,i=n,n=a;e.h0=e.h0+n|0,e.h1=e.h1+i|0,e.h2=e.h2+s|0,e.h3=e.h3+o|0,e.h4=e.h4+c|0,p-=64}}var i=r(0);r(4),r(1);var s=e.exports=i.sha1=i.sha1||{};i.md.sha1=i.md.algorithms.sha1=s,s.create=function(){c||a();var e=null,t=i.util.createBuffer(),r=new Array(80),s={algorithm:"sha1",blockLength:64,digestLength:20,messageLength:0,fullMessageLength:null,messageLengthSize:8};return s.start=function(){s.messageLength=0,s.fullMessageLength=s.messageLength64=[];for(var r=s.messageLengthSize/4,a=0;a<r;++a)s.fullMessageLength.push(0);return t=i.util.createBuffer(),e={h0:1732584193,h1:4023233417,h2:2562383102,h3:271733878,h4:3285377520},s},s.start(),s.update=function(a,o){"utf8"===o&&(a=i.util.encodeUtf8(a));var c=a.length;s.messageLength+=c,c=[c/4294967296>>>0,c>>>0];for(var u=s.fullMessageLength.length-1;u>=0;--u)s.fullMessageLength[u]+=c[1],c[1]=c[0]+(s.fullMessageLength[u]/4294967296>>>0),s.fullMessageLength[u]=s.fullMessageLength[u]>>>0,c[0]=c[1]/4294967296>>>0;return t.putBytes(a),n(e,r,t),(t.read>2048||0===t.length())&&t.compact(),s},s.digest=function(){var a=i.util.createBuffer();a.putBytes(t.bytes());var c=s.fullMessageLength[s.fullMessageLength.length-1]+s.messageLengthSize,u=c&s.blockLength-1;a.putBytes(o.substr(0,s.blockLength-u));for(var l,p,h=8*s.fullMessageLength[0],f=0;f<s.fullMessageLength.length-1;++f)l=8*s.fullMessageLength[f+1],p=l/4294967296>>>0,h+=p,a.putInt32(h>>>0),h=l>>>0;a.putInt32(h);var d={h0:e.h0,h1:e.h1,h2:e.h2,h3:e.h3,h4:e.h4};n(d,r,a);var y=i.util.createBuffer();return y.putInt32(d.h0),y.putInt32(d.h1),y.putInt32(d.h2),y.putInt32(d.h3),y.putInt32(d.h4),y},s};var o=null,c=!1},function(e,t,r){function a(e,t){var r=function(){return new o.des.Algorithm(e,t)};o.cipher.registerAlgorithm(e,r)}function n(e){for(var t,r=[0,4,536870912,536870916,65536,65540,536936448,536936452,512,516,536871424,536871428,66048,66052,536936960,536936964],a=[0,1,1048576,1048577,67108864,67108865,68157440,68157441,256,257,1048832,1048833,67109120,67109121,68157696,68157697],n=[0,8,2048,2056,16777216,16777224,16779264,16779272,0,8,2048,2056,16777216,16777224,16779264,16779272],i=[0,2097152,134217728,136314880,8192,2105344,134225920,136323072,131072,2228224,134348800,136445952,139264,2236416,134356992,136454144],s=[0,262144,16,262160,0,262144,16,262160,4096,266240,4112,266256,4096,266240,4112,266256],o=[0,1024,32,1056,0,1024,32,1056,33554432,33555456,33554464,33555488,33554432,33555456,33554464,33555488],c=[0,268435456,524288,268959744,2,268435458,524290,268959746,0,268435456,524288,268959744,2,268435458,524290,268959746],u=[0,65536,2048,67584,536870912,536936448,536872960,536938496,131072,196608,133120,198656,537001984,537067520,537004032,537069568],l=[0,262144,0,262144,2,262146,2,262146,33554432,33816576,33554432,33816576,33554434,33816578,33554434,33816578],p=[0,268435456,8,268435464,0,268435456,8,268435464,1024,268436480,1032,268436488,1024,268436480,1032,268436488],h=[0,32,0,32,1048576,1048608,1048576,1048608,8192,8224,8192,8224,1056768,1056800,1056768,1056800],f=[0,16777216,512,16777728,2097152,18874368,2097664,18874880,67108864,83886080,67109376,83886592,69206016,85983232,69206528,85983744],d=[0,4096,134217728,134221824,524288,528384,134742016,134746112,16,4112,134217744,134221840,524304,528400,134742032,134746128],y=[0,4,256,260,0,4,256,260,1,5,257,261,1,5,257,261],g=e.length()>8?3:1,v=[],m=[0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0],C=0,E=0;E<g;E++){var S=e.getInt32(),T=e.getInt32();t=252645135&(S>>>4^T),T^=t,S^=t<<4,t=65535&(T>>>-16^S),S^=t,T^=t<<-16,t=858993459&(S>>>2^T),T^=t,S^=t<<2,t=65535&(T>>>-16^S),S^=t,T^=t<<-16,t=1431655765&(S>>>1^T),T^=t,S^=t<<1,t=16711935&(T>>>8^S),S^=t,T^=t<<8,t=1431655765&(S>>>1^T),T^=t,S^=t<<1,t=S<<8|T>>>20&240,S=T<<24|T<<8&16711680|T>>>8&65280|T>>>24&240,T=t;for(var I=0;I<m.length;++I){m[I]?(S=S<<2|S>>>26,T=T<<2|T>>>26):(S=S<<1|S>>>27,T=T<<1|T>>>27),S&=-15,T&=-15;var A=r[S>>>28]|a[S>>>24&15]|n[S>>>20&15]|i[S>>>16&15]|s[S>>>12&15]|o[S>>>8&15]|c[S>>>4&15],b=u[T>>>28]|l[T>>>24&15]|p[T>>>20&15]|h[T>>>16&15]|f[T>>>12&15]|d[T>>>8&15]|y[T>>>4&15];t=65535&(b>>>16^A),v[C++]=A^t,v[C++]=b^t<<16}}return v}function i(e,t,r,a){var n,i=32===e.length?3:9;n=3===i?a?[30,-2,-2]:[0,32,2]:a?[94,62,-2,32,64,2,30,-2,-2]:[0,32,2,62,30,-2,64,96,2];var s,o=t[0],g=t[1];s=252645135&(o>>>4^g),g^=s,o^=s<<4,s=65535&(o>>>16^g),g^=s,o^=s<<16,s=858993459&(g>>>2^o),o^=s,g^=s<<2,s=16711935&(g>>>8^o),o^=s,g^=s<<8,s=1431655765&(o>>>1^g),g^=s,o^=s<<1,o=o<<1|o>>>31,g=g<<1|g>>>31;for(var v=0;v<i;v+=3){for(var m=n[v+1],C=n[v+2],E=n[v];E!=m;E+=C){var S=g^e[E],T=(g>>>4|g<<28)^e[E+1];s=o,o=g,g=s^(u[S>>>24&63]|p[S>>>16&63]|f[S>>>8&63]|y[63&S]|c[T>>>24&63]|l[T>>>16&63]|h[T>>>8&63]|d[63&T])}s=o,o=g,g=s}o=o>>>1|o<<31,g=g>>>1|g<<31,s=1431655765&(o>>>1^g),g^=s,o^=s<<1,s=16711935&(g>>>8^o),o^=s,g^=s<<8,s=858993459&(g>>>2^o),o^=s,g^=s<<2,s=65535&(o>>>16^g),g^=s,o^=s<<16,s=252645135&(o>>>4^g),g^=s,o^=s<<4,r[0]=o,r[1]=g}function s(e){e=e||{};var t,r=(e.mode||"CBC").toUpperCase(),a="DES-"+r;t=e.decrypt?o.cipher.createDecipher(a,e.key):o.cipher.createCipher(a,e.key);var n=t.start;return t.start=function(e,r){var a=null;r instanceof o.util.ByteBuffer&&(a=r,r={}),r=r||{},r.output=a,r.iv=e,n.call(t,r)},t}var o=r(0);r(12),r(18),r(1),e.exports=o.des=o.des||{},o.des.startEncrypting=function(e,t,r,a){var n=s({key:e,output:r,decrypt:!1,mode:a||(null===t?"ECB":"CBC")});return n.start(t),n},o.des.createEncryptionCipher=function(e,t){return s({key:e,output:null,decrypt:!1,mode:t})},o.des.startDecrypting=function(e,t,r,a){var n=s({key:e,output:r,decrypt:!0,mode:a||(null===t?"ECB":"CBC")});return n.start(t),n},o.des.createDecryptionCipher=function(e,t){return s({key:e,output:null,decrypt:!0,mode:t})},o.des.Algorithm=function(e,t){var r=this;r.name=e,r.mode=new t({blockSize:8,cipher:{encrypt:function(e,t){return i(r._keys,e,t,!1)},decrypt:function(e,t){return i(r._keys,e,t,!0)}}}),r._init=!1},o.des.Algorithm.prototype.initialize=function(e){if(!this._init){var t=o.util.createBuffer(e.key);if(0===this.name.indexOf("3DES")&&24!==t.length())throw new Error("Invalid Triple-DES key size: "+8*t.length());this._keys=n(t),this._init=!0}},a("DES-ECB",o.cipher.modes.ecb),a("DES-CBC",o.cipher.modes.cbc),a("DES-CFB",o.cipher.modes.cfb),a("DES-OFB",o.cipher.modes.ofb),a("DES-CTR",o.cipher.modes.ctr),a("3DES-ECB",o.cipher.modes.ecb),a("3DES-CBC",o.cipher.modes.cbc),a("3DES-CFB",o.cipher.modes.cfb),a("3DES-OFB",o.cipher.modes.ofb),a("3DES-CTR",o.cipher.modes.ctr);var c=[16843776,0,65536,16843780,16842756,66564,4,65536,1024,16843776,16843780,1024,16778244,16842756,16777216,4,1028,16778240,16778240,66560,66560,16842752,16842752,16778244,65540,16777220,16777220,65540,0,1028,66564,16777216,65536,16843780,4,16842752,16843776,16777216,16777216,1024,16842756,65536,66560,16777220,1024,4,16778244,66564,16843780,65540,16842752,16778244,16777220,1028,66564,16843776,1028,16778240,16778240,0,65540,66560,0,16842756],u=[-2146402272,-2147450880,32768,1081376,1048576,32,-2146435040,-2147450848,-2147483616,-2146402272,-2146402304,-2147483648,-2147450880,1048576,32,-2146435040,1081344,1048608,-2147450848,0,-2147483648,32768,1081376,-2146435072,1048608,-2147483616,0,1081344,32800,-2146402304,-2146435072,32800,0,1081376,-2146435040,1048576,-2147450848,-2146435072,-2146402304,32768,-2146435072,-2147450880,32,-2146402272,1081376,32,32768,-2147483648,32800,-2146402304,1048576,-2147483616,1048608,-2147450848,-2147483616,1048608,1081344,0,-2147450880,32800,-2147483648,-2146435040,-2146402272,1081344],l=[520,134349312,0,134348808,134218240,0,131592,134218240,131080,134217736,134217736,131072,134349320,131080,134348800,520,134217728,8,134349312,512,131584,134348800,134348808,131592,134218248,131584,131072,134218248,8,134349320,512,134217728,134349312,134217728,131080,520,131072,134349312,134218240,0,512,131080,134349320,134218240,134217736,512,0,134348808,134218248,131072,134217728,134349320,8,131592,131584,134217736,134348800,134218248,520,134348800,131592,8,134348808,131584],p=[8396801,8321,8321,128,8396928,8388737,8388609,8193,0,8396800,8396800,8396929,129,0,8388736,8388609,1,8192,8388608,8396801,128,8388608,8193,8320,8388737,1,8320,8388736,8192,8396928,8396929,129,8388736,8388609,8396800,8396929,129,0,0,8396800,8320,8388736,8388737,1,8396801,8321,8321,128,8396929,129,1,8192,8388609,8193,8396928,8388737,8193,8320,8388608,8396801,128,8388608,8192,8396928],h=[256,34078976,34078720,1107296512,524288,256,1073741824,34078720,1074266368,524288,33554688,1074266368,1107296512,1107820544,524544,1073741824,33554432,1074266112,1074266112,0,1073742080,1107820800,1107820800,33554688,1107820544,1073742080,0,1107296256,34078976,33554432,1107296256,524544,524288,1107296512,256,33554432,1073741824,34078720,1107296512,1074266368,33554688,1073741824,1107820544,34078976,1074266368,256,33554432,1107820544,1107820800,524544,1107296256,1107820800,34078720,0,1074266112,1107296256,524544,33554688,1073742080,524288,0,1074266112,34078976,1073742080],f=[536870928,541065216,16384,541081616,541065216,16,541081616,4194304,536887296,4210704,4194304,536870928,4194320,536887296,536870912,16400,0,4194320,536887312,16384,4210688,536887312,16,541065232,541065232,0,4210704,541081600,16400,4210688,541081600,536870912,536887296,16,541065232,4210688,541081616,4194304,16400,536870928,4194304,536887296,536870912,16400,536870928,541081616,4210688,541065216,4210704,541081600,0,541065232,16,16384,541065216,4210704,16384,4194320,536887312,0,541081600,536870912,4194320,536887312],d=[2097152,69206018,67110914,0,2048,67110914,2099202,69208064,69208066,2097152,0,67108866,2,67108864,69206018,2050,67110912,2099202,2097154,67110912,67108866,69206016,69208064,2097154,69206016,2048,2050,69208066,2099200,2,67108864,2099200,67108864,2099200,2097152,67110914,67110914,69206018,69206018,2,2097154,67108864,67110912,2097152,69208064,2050,2099202,69208064,2050,67108866,69208066,69206016,2099200,0,2,69208066,0,2099202,69206016,2048,67108866,67110912,2048,2097154],y=[268439616,4096,262144,268701760,268435456,268439616,64,268435456,262208,268697600,268701760,266240,268701696,266304,4096,64,268697600,268435520,268439552,4160,266240,262208,268697664,268701696,4160,0,0,268697664,268435520,268439552,266304,262144,266304,262144,268701696,4096,64,268697664,4096,266304,268439552,64,268435520,268697600,268697664,268435456,262144,268439616,0,268701760,262208,268435520,268697600,268439552,268439616,0,268701760,266240,266240,4160,4160,262208,268435456,268701696]},function(e,t,r){function a(e,t,r){var a=p.util.createBuffer(),n=Math.ceil(t.n.bitLength()/8);if(e.length>n-11){var i=new Error("Message is too long for PKCS#1 v1.5 padding.");throw i.length=e.length,i.max=n-11,i}a.putByte(0),a.putByte(r);var s,o=n-3-e.length;if(0===r||1===r){s=0===r?0:255;for(var c=0;c<o;++c)a.putByte(s)}else for(;o>0;){for(var u=0,l=p.random.getBytes(o),c=0;c<o;++c)s=l.charCodeAt(c),0===s?++u:a.putByte(s);o=u}return a.putByte(0),a.putBytes(e),a}function n(e,t,r,a){var n=Math.ceil(t.n.bitLength()/8),i=p.util.createBuffer(e),s=i.getByte(),o=i.getByte();if(0!==s||r&&0!==o&&1!==o||!r&&2!=o||r&&0===o&&"undefined"==typeof a)throw new Error("Encryption block is invalid.");var c=0;if(0===o){c=n-3-a;for(var u=0;u<c;++u)if(0!==i.getByte())throw new Error("Encryption block is invalid.")}else if(1===o)for(c=0;i.length()>1;){if(255!==i.getByte()){--i.read;break}++c}else if(2===o)for(c=0;i.length()>1;){if(0===i.getByte()){--i.read;break}++c}var l=i.getByte();if(0!==l||c!==n-3-i.length())throw new Error("Encryption block is invalid.");return i.getBytes()}function i(e,t,r){function a(){n(e.pBits,function(t,a){return t?r(t):(e.p=a,null!==e.q?i(t,e.q):void n(e.qBits,i))})}function n(e,t){p.prime.generateProbablePrime(e,s,t)}function i(t,s){if(t)return r(t);if(e.q=s,e.p.compareTo(e.q)<0){var o=e.p;e.p=e.q,e.q=o}if(0!==e.p.subtract(h.ONE).gcd(e.e).compareTo(h.ONE))return e.p=null,void a();if(0!==e.q.subtract(h.ONE).gcd(e.e).compareTo(h.ONE))return e.q=null,void n(e.qBits,i);if(e.p1=e.p.subtract(h.ONE),e.q1=e.q.subtract(h.ONE),e.phi=e.p1.multiply(e.q1),0!==e.phi.gcd(e.e).compareTo(h.ONE))return e.p=e.q=null,void a();if(e.n=e.p.multiply(e.q),e.n.bitLength()!==e.bits)return e.q=null,void n(e.qBits,i);var c=e.e.modInverse(e.phi);e.keys={privateKey:d.rsa.setPrivateKey(e.n,e.e,c,e.p,e.q,c.mod(e.p1),c.mod(e.q1),e.q.modInverse(e.p)),publicKey:d.rsa.setPublicKey(e.n,e.e)},r(null,e.keys)}"function"==typeof t&&(r=t,t={}),t=t||{};var s={algorithm:{name:t.algorithm||"PRIMEINC",options:{workers:t.workers||2,workLoad:t.workLoad||100,workerScript:t.workerScript}}};"prng"in t&&(s.prng=t.prng),a()}function s(e){var t=e.toString(16);t[0]>="8"&&(t="00"+t);var r=p.util.hexToBytes(t);return r.length>1&&(0===r.charCodeAt(0)&&0===(128&r.charCodeAt(1))||255===r.charCodeAt(0)&&128===(128&r.charCodeAt(1)))?r.substr(1):r}function o(e){return e<=100?27:e<=150?18:e<=200?15:e<=250?12:e<=300?9:e<=350?8:e<=400?7:e<=500?6:e<=600?5:e<=800?4:e<=1250?3:2}function c(e){return"undefined"!=typeof window&&"object"==typeof window.crypto&&"object"==typeof window.crypto.subtle&&"function"==typeof window.crypto.subtle[e];
}function u(e){return"undefined"!=typeof window&&"object"==typeof window.msCrypto&&"object"==typeof window.msCrypto.subtle&&"function"==typeof window.msCrypto.subtle[e]}function l(e){for(var t=p.util.hexToBytes(e.toString(16)),r=new Uint8Array(t.length),a=0;a<t.length;++a)r[a]=t.charCodeAt(a);return r}var p=r(0);if(r(3),r(13),r(6),r(23),r(27),r(2),r(1),"undefined"==typeof h)var h=p.jsbn.BigInteger;var f=p.asn1;p.pki=p.pki||{},e.exports=p.pki.rsa=p.rsa=p.rsa||{};var d=p.pki,y=[6,4,2,4,2,4,6,2],g={name:"PrivateKeyInfo",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,value:[{name:"PrivateKeyInfo.version",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyVersion"},{name:"PrivateKeyInfo.privateKeyAlgorithm",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:f.Class.UNIVERSAL,type:f.Type.OID,constructed:!1,capture:"privateKeyOid"}]},{name:"PrivateKeyInfo",tagClass:f.Class.UNIVERSAL,type:f.Type.OCTETSTRING,constructed:!1,capture:"privateKey"}]},v={name:"RSAPrivateKey",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,value:[{name:"RSAPrivateKey.version",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyVersion"},{name:"RSAPrivateKey.modulus",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyModulus"},{name:"RSAPrivateKey.publicExponent",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyPublicExponent"},{name:"RSAPrivateKey.privateExponent",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyPrivateExponent"},{name:"RSAPrivateKey.prime1",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyPrime1"},{name:"RSAPrivateKey.prime2",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyPrime2"},{name:"RSAPrivateKey.exponent1",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyExponent1"},{name:"RSAPrivateKey.exponent2",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyExponent2"},{name:"RSAPrivateKey.coefficient",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"privateKeyCoefficient"}]},m={name:"RSAPublicKey",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,value:[{name:"RSAPublicKey.modulus",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"publicKeyModulus"},{name:"RSAPublicKey.exponent",tagClass:f.Class.UNIVERSAL,type:f.Type.INTEGER,constructed:!1,capture:"publicKeyExponent"}]},C=p.pki.rsa.publicKeyValidator={name:"SubjectPublicKeyInfo",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,captureAsn1:"subjectPublicKeyInfo",value:[{name:"SubjectPublicKeyInfo.AlgorithmIdentifier",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:f.Class.UNIVERSAL,type:f.Type.OID,constructed:!1,capture:"publicKeyOid"}]},{name:"SubjectPublicKeyInfo.subjectPublicKey",tagClass:f.Class.UNIVERSAL,type:f.Type.BITSTRING,constructed:!1,value:[{name:"SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",tagClass:f.Class.UNIVERSAL,type:f.Type.SEQUENCE,constructed:!0,optional:!0,captureAsn1:"rsaPublicKey"}]}]},E=function(e){var t;if(!(e.algorithm in d.oids)){var r=new Error("Unknown message digest algorithm.");throw r.algorithm=e.algorithm,r}t=d.oids[e.algorithm];var a=f.oidToDer(t).getBytes(),n=f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[]),i=f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[]);i.value.push(f.create(f.Class.UNIVERSAL,f.Type.OID,!1,a)),i.value.push(f.create(f.Class.UNIVERSAL,f.Type.NULL,!1,""));var s=f.create(f.Class.UNIVERSAL,f.Type.OCTETSTRING,!1,e.digest().getBytes());return n.value.push(i),n.value.push(s),f.toDer(n).getBytes()},S=function(e,t,r){if(r)return e.modPow(t.e,t.n);if(!t.p||!t.q)return e.modPow(t.d,t.n);t.dP||(t.dP=t.d.mod(t.p.subtract(h.ONE))),t.dQ||(t.dQ=t.d.mod(t.q.subtract(h.ONE))),t.qInv||(t.qInv=t.q.modInverse(t.p));var a;do a=new h(p.util.bytesToHex(p.random.getBytes(t.n.bitLength()/8)),16);while(a.compareTo(t.n)>=0||!a.gcd(t.n).equals(h.ONE));e=e.multiply(a.modPow(t.e,t.n)).mod(t.n);for(var n=e.mod(t.p).modPow(t.dP,t.p),i=e.mod(t.q).modPow(t.dQ,t.q);n.compareTo(i)<0;)n=n.add(t.p);var s=n.subtract(i).multiply(t.qInv).mod(t.p).multiply(t.q).add(i);return s=s.multiply(a.modInverse(t.n)).mod(t.n)};d.rsa.encrypt=function(e,t,r){var n,i=r,s=Math.ceil(t.n.bitLength()/8);r!==!1&&r!==!0?(i=2===r,n=a(e,t,r)):(n=p.util.createBuffer(),n.putBytes(e));for(var o=new h(n.toHex(),16),c=S(o,t,i),u=c.toString(16),l=p.util.createBuffer(),f=s-Math.ceil(u.length/2);f>0;)l.putByte(0),--f;return l.putBytes(p.util.hexToBytes(u)),l.getBytes()},d.rsa.decrypt=function(e,t,r,a){var i=Math.ceil(t.n.bitLength()/8);if(e.length!==i){var s=new Error("Encrypted message length is invalid.");throw s.length=e.length,s.expected=i,s}var o=new h(p.util.createBuffer(e).toHex(),16);if(o.compareTo(t.n)>=0)throw new Error("Encrypted message is invalid.");for(var c=S(o,t,r),u=c.toString(16),l=p.util.createBuffer(),f=i-Math.ceil(u.length/2);f>0;)l.putByte(0),--f;return l.putBytes(p.util.hexToBytes(u)),a!==!1?n(l.getBytes(),t,r):l.getBytes()},d.rsa.createKeyPairGenerationState=function(e,t,r){"string"==typeof e&&(e=parseInt(e,10)),e=e||2048,r=r||{};var a,n=r.prng||p.random,i={nextBytes:function(e){for(var t=n.getBytesSync(e.length),r=0;r<e.length;++r)e[r]=t.charCodeAt(r)}},s=r.algorithm||"PRIMEINC";if("PRIMEINC"!==s)throw new Error("Invalid key generation algorithm: "+s);return a={algorithm:s,state:0,bits:e,rng:i,eInt:t||65537,e:new h(null),p:null,q:null,qBits:e>>1,pBits:e-(e>>1),pqState:0,num:null,keys:null},a.e.fromInt(a.eInt),a},d.rsa.stepKeyPairGenerationState=function(e,t){"algorithm"in e||(e.algorithm="PRIMEINC");var r=new h(null);r.fromInt(30);for(var a,n=0,i=function(e,t){return e|t},s=+new Date,c=0;null===e.keys&&(t<=0||c<t);){if(0===e.state){var u=null===e.p?e.pBits:e.qBits,l=u-1;0===e.pqState?(e.num=new h(u,e.rng),e.num.testBit(l)||e.num.bitwiseTo(h.ONE.shiftLeft(l),i,e.num),e.num.dAddOffset(31-e.num.mod(r).byteValue(),0),n=0,++e.pqState):1===e.pqState?e.num.bitLength()>u?e.pqState=0:e.num.isProbablePrime(o(e.num.bitLength()))?++e.pqState:e.num.dAddOffset(y[n++%8],0):2===e.pqState?e.pqState=0===e.num.subtract(h.ONE).gcd(e.e).compareTo(h.ONE)?3:0:3===e.pqState&&(e.pqState=0,null===e.p?e.p=e.num:e.q=e.num,null!==e.p&&null!==e.q&&++e.state,e.num=null)}else if(1===e.state)e.p.compareTo(e.q)<0&&(e.num=e.p,e.p=e.q,e.q=e.num),++e.state;else if(2===e.state)e.p1=e.p.subtract(h.ONE),e.q1=e.q.subtract(h.ONE),e.phi=e.p1.multiply(e.q1),++e.state;else if(3===e.state)0===e.phi.gcd(e.e).compareTo(h.ONE)?++e.state:(e.p=null,e.q=null,e.state=0);else if(4===e.state)e.n=e.p.multiply(e.q),e.n.bitLength()===e.bits?++e.state:(e.q=null,e.state=0);else if(5===e.state){var p=e.e.modInverse(e.phi);e.keys={privateKey:d.rsa.setPrivateKey(e.n,e.e,p,e.p,e.q,p.mod(e.p1),p.mod(e.q1),e.q.modInverse(e.p)),publicKey:d.rsa.setPublicKey(e.n,e.e)}}a=+new Date,c+=a-s,s=a}return null!==e.keys},d.rsa.generateKeyPair=function(e,t,r,a){if(1===arguments.length?"object"==typeof e?(r=e,e=void 0):"function"==typeof e&&(a=e,e=void 0):2===arguments.length?"number"==typeof e?"function"==typeof t?(a=t,t=void 0):"number"!=typeof t&&(r=t,t=void 0):(r=e,a=t,e=void 0,t=void 0):3===arguments.length&&("number"==typeof t?"function"==typeof r&&(a=r,r=void 0):(a=r,r=t,t=void 0)),r=r||{},void 0===e&&(e=r.bits||2048),void 0===t&&(t=r.e||65537),!p.options.usePureJavaScript&&a&&e>=256&&e<=16384&&(65537===t||3===t)){if(c("generateKey")&&c("exportKey"))return window.crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:e,publicExponent:l(t),hash:{name:"SHA-256"}},!0,["sign","verify"]).then(function(e){return window.crypto.subtle.exportKey("pkcs8",e.privateKey)}).then(void 0,function(e){a(e)}).then(function(e){if(e){var t=d.privateKeyFromAsn1(f.fromDer(p.util.createBuffer(e)));a(null,{privateKey:t,publicKey:d.setRsaPublicKey(t.n,t.e)})}});if(u("generateKey")&&u("exportKey")){var n=window.msCrypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:e,publicExponent:l(t),hash:{name:"SHA-256"}},!0,["sign","verify"]);return n.oncomplete=function(e){var t=e.target.result,r=window.msCrypto.subtle.exportKey("pkcs8",t.privateKey);r.oncomplete=function(e){var t=e.target.result,r=d.privateKeyFromAsn1(f.fromDer(p.util.createBuffer(t)));a(null,{privateKey:r,publicKey:d.setRsaPublicKey(r.n,r.e)})},r.onerror=function(e){a(e)}},void(n.onerror=function(e){a(e)})}}var s=d.rsa.createKeyPairGenerationState(e,t,r);return a?void i(s,r,a):(d.rsa.stepKeyPairGenerationState(s,0),s.keys)},d.setRsaPublicKey=d.rsa.setPublicKey=function(e,t){var r={n:e,e:t};return r.encrypt=function(e,t,n){if("string"==typeof t?t=t.toUpperCase():void 0===t&&(t="RSAES-PKCS1-V1_5"),"RSAES-PKCS1-V1_5"===t)t={encode:function(e,t,r){return a(e,t,2).getBytes()}};else if("RSA-OAEP"===t||"RSAES-OAEP"===t)t={encode:function(e,t){return p.pkcs1.encode_rsa_oaep(t,e,n)}};else if(["RAW","NONE","NULL",null].indexOf(t)!==-1)t={encode:function(e){return e}};else if("string"==typeof t)throw new Error('Unsupported encryption scheme: "'+t+'".');var i=t.encode(e,r,!0);return d.rsa.encrypt(i,r,!0)},r.verify=function(e,t,a){"string"==typeof a?a=a.toUpperCase():void 0===a&&(a="RSASSA-PKCS1-V1_5"),"RSASSA-PKCS1-V1_5"===a?a={verify:function(e,t){t=n(t,r,!0);var a=f.fromDer(t);return e===a.value[1].value}}:"NONE"!==a&&"NULL"!==a&&null!==a||(a={verify:function(e,t){return t=n(t,r,!0),e===t}});var i=d.rsa.decrypt(t,r,!0,!1);return a.verify(e,i,r.n.bitLength())},r},d.setRsaPrivateKey=d.rsa.setPrivateKey=function(e,t,r,a,i,s,o,c){var u={n:e,e:t,d:r,p:a,q:i,dP:s,dQ:o,qInv:c};return u.decrypt=function(e,t,r){"string"==typeof t?t=t.toUpperCase():void 0===t&&(t="RSAES-PKCS1-V1_5");var a=d.rsa.decrypt(e,u,!1,!1);if("RSAES-PKCS1-V1_5"===t)t={decode:n};else if("RSA-OAEP"===t||"RSAES-OAEP"===t)t={decode:function(e,t){return p.pkcs1.decode_rsa_oaep(t,e,r)}};else{if(["RAW","NONE","NULL",null].indexOf(t)===-1)throw new Error('Unsupported encryption scheme: "'+t+'".');t={decode:function(e){return e}}}return t.decode(a,u,!1)},u.sign=function(e,t){var r=!1;"string"==typeof t&&(t=t.toUpperCase()),void 0===t||"RSASSA-PKCS1-V1_5"===t?(t={encode:E},r=1):"NONE"!==t&&"NULL"!==t&&null!==t||(t={encode:function(){return e}},r=1);var a=t.encode(e,u.n.bitLength());return d.rsa.encrypt(a,u,r)},u},d.wrapRsaPrivateKey=function(e){return f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,f.integerToDer(0).getBytes()),f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.OID,!1,f.oidToDer(d.oids.rsaEncryption).getBytes()),f.create(f.Class.UNIVERSAL,f.Type.NULL,!1,"")]),f.create(f.Class.UNIVERSAL,f.Type.OCTETSTRING,!1,f.toDer(e).getBytes())])},d.privateKeyFromAsn1=function(e){var t={},r=[];if(f.validate(e,g,t,r)&&(e=f.fromDer(p.util.createBuffer(t.privateKey))),t={},r=[],!f.validate(e,v,t,r)){var a=new Error("Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.");throw a.errors=r,a}var n,i,s,o,c,u,l,y;return n=p.util.createBuffer(t.privateKeyModulus).toHex(),i=p.util.createBuffer(t.privateKeyPublicExponent).toHex(),s=p.util.createBuffer(t.privateKeyPrivateExponent).toHex(),o=p.util.createBuffer(t.privateKeyPrime1).toHex(),c=p.util.createBuffer(t.privateKeyPrime2).toHex(),u=p.util.createBuffer(t.privateKeyExponent1).toHex(),l=p.util.createBuffer(t.privateKeyExponent2).toHex(),y=p.util.createBuffer(t.privateKeyCoefficient).toHex(),d.setRsaPrivateKey(new h(n,16),new h(i,16),new h(s,16),new h(o,16),new h(c,16),new h(u,16),new h(l,16),new h(y,16))},d.privateKeyToAsn1=d.privateKeyToRSAPrivateKey=function(e){return f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,f.integerToDer(0).getBytes()),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.n)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.e)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.d)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.p)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.q)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.dP)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.dQ)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.qInv))])},d.publicKeyFromAsn1=function(e){var t={},r=[];if(f.validate(e,C,t,r)){var a=f.derToOid(t.publicKeyOid);if(a!==d.oids.rsaEncryption){var n=new Error("Cannot read public key. Unknown OID.");throw n.oid=a,n}e=t.rsaPublicKey}if(r=[],!f.validate(e,m,t,r)){var n=new Error("Cannot read public key. ASN.1 object does not contain an RSAPublicKey.");throw n.errors=r,n}var i=p.util.createBuffer(t.publicKeyModulus).toHex(),s=p.util.createBuffer(t.publicKeyExponent).toHex();return d.setRsaPublicKey(new h(i,16),new h(s,16))},d.publicKeyToAsn1=d.publicKeyToSubjectPublicKeyInfo=function(e){return f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.OID,!1,f.oidToDer(d.oids.rsaEncryption).getBytes()),f.create(f.Class.UNIVERSAL,f.Type.NULL,!1,"")]),f.create(f.Class.UNIVERSAL,f.Type.BITSTRING,!1,[d.publicKeyToRSAPublicKey(e)])])},d.publicKeyToRSAPublicKey=function(e){return f.create(f.Class.UNIVERSAL,f.Type.SEQUENCE,!0,[f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.n)),f.create(f.Class.UNIVERSAL,f.Type.INTEGER,!1,s(e.e))])}},function(e,t,r){var a=r(0);r(1),e.exports=a.cipher=a.cipher||{},a.cipher.algorithms=a.cipher.algorithms||{},a.cipher.createCipher=function(e,t){var r=e;if("string"==typeof r&&(r=a.cipher.getAlgorithm(r),r&&(r=r())),!r)throw new Error("Unsupported algorithm: "+e);return new a.cipher.BlockCipher({algorithm:r,key:t,decrypt:!1})},a.cipher.createDecipher=function(e,t){var r=e;if("string"==typeof r&&(r=a.cipher.getAlgorithm(r),r&&(r=r())),!r)throw new Error("Unsupported algorithm: "+e);return new a.cipher.BlockCipher({algorithm:r,key:t,decrypt:!0})},a.cipher.registerAlgorithm=function(e,t){e=e.toUpperCase(),a.cipher.algorithms[e]=t},a.cipher.getAlgorithm=function(e){return e=e.toUpperCase(),e in a.cipher.algorithms?a.cipher.algorithms[e]:null};var n=a.cipher.BlockCipher=function(e){this.algorithm=e.algorithm,this.mode=this.algorithm.mode,this.blockSize=this.mode.blockSize,this._finish=!1,this._input=null,this.output=null,this._op=e.decrypt?this.mode.decrypt:this.mode.encrypt,this._decrypt=e.decrypt,this.algorithm.initialize(e)};n.prototype.start=function(e){e=e||{};var t={};for(var r in e)t[r]=e[r];t.decrypt=this._decrypt,this._finish=!1,this._input=a.util.createBuffer(),this.output=e.output||a.util.createBuffer(),this.mode.start(t)},n.prototype.update=function(e){for(e&&this._input.putBuffer(e);!this._op.call(this.mode,this._input,this.output,this._finish)&&!this._finish;);this._input.compact()},n.prototype.finish=function(e){!e||"ECB"!==this.mode.name&&"CBC"!==this.mode.name||(this.mode.pad=function(t){return e(this.blockSize,t,!1)},this.mode.unpad=function(t){return e(this.blockSize,t,!0)});var t={};return t.decrypt=this._decrypt,t.overflow=this._input.length()%this.blockSize,!(!this._decrypt&&this.mode.pad&&!this.mode.pad(this._input,t))&&(this._finish=!0,this.update(),!(this._decrypt&&this.mode.unpad&&!this.mode.unpad(this.output,t))&&!(this.mode.afterFinish&&!this.mode.afterFinish(this.output,t)))}},function(e,t,r){function a(e,t,r){this.data=[],null!=e&&("number"==typeof e?this.fromNumber(e,t,r):null==t&&"string"!=typeof e?this.fromString(e,256):this.fromString(e,t))}function n(){return new a(null)}function i(e,t,r,a,n,i){for(;--i>=0;){var s=t*this.data[e++]+r.data[a]+n;n=Math.floor(s/67108864),r.data[a++]=67108863&s}return n}function s(e,t,r,a,n,i){for(var s=32767&t,o=t>>15;--i>=0;){var c=32767&this.data[e],u=this.data[e++]>>15,l=o*c+u*s;c=s*c+((32767&l)<<15)+r.data[a]+(1073741823&n),n=(c>>>30)+(l>>>15)+o*u+(n>>>30),r.data[a++]=1073741823&c}return n}function o(e,t,r,a,n,i){for(var s=16383&t,o=t>>14;--i>=0;){var c=16383&this.data[e],u=this.data[e++]>>14,l=o*c+u*s;c=s*c+((16383&l)<<14)+r.data[a]+n,n=(c>>28)+(l>>14)+o*u,r.data[a++]=268435455&c}return n}function c(e){return ct.charAt(e)}function u(e,t){var r=ut[e.charCodeAt(t)];return null==r?-1:r}function l(e){for(var t=this.t-1;t>=0;--t)e.data[t]=this.data[t];e.t=this.t,e.s=this.s}function p(e){this.t=1,this.s=e<0?-1:0,e>0?this.data[0]=e:e<-1?this.data[0]=e+this.DV:this.t=0}function h(e){var t=n();return t.fromInt(e),t}function f(e,t){var r;if(16==t)r=4;else if(8==t)r=3;else if(256==t)r=8;else if(2==t)r=1;else if(32==t)r=5;else{if(4!=t)return void this.fromRadix(e,t);r=2}this.t=0,this.s=0;for(var n=e.length,i=!1,s=0;--n>=0;){var o=8==r?255&e[n]:u(e,n);o<0?"-"==e.charAt(n)&&(i=!0):(i=!1,0==s?this.data[this.t++]=o:s+r>this.DB?(this.data[this.t-1]|=(o&(1<<this.DB-s)-1)<<s,this.data[this.t++]=o>>this.DB-s):this.data[this.t-1]|=o<<s,s+=r,s>=this.DB&&(s-=this.DB))}8==r&&0!=(128&e[0])&&(this.s=-1,s>0&&(this.data[this.t-1]|=(1<<this.DB-s)-1<<s)),this.clamp(),i&&a.ZERO.subTo(this,this)}function d(){for(var e=this.s&this.DM;this.t>0&&this.data[this.t-1]==e;)--this.t}function y(e){if(this.s<0)return"-"+this.negate().toString(e);var t;if(16==e)t=4;else if(8==e)t=3;else if(2==e)t=1;else if(32==e)t=5;else{if(4!=e)return this.toRadix(e);t=2}var r,a=(1<<t)-1,n=!1,i="",s=this.t,o=this.DB-s*this.DB%t;if(s-- >0)for(o<this.DB&&(r=this.data[s]>>o)>0&&(n=!0,i=c(r));s>=0;)o<t?(r=(this.data[s]&(1<<o)-1)<<t-o,r|=this.data[--s]>>(o+=this.DB-t)):(r=this.data[s]>>(o-=t)&a,o<=0&&(o+=this.DB,--s)),r>0&&(n=!0),n&&(i+=c(r));return n?i:"0"}function g(){var e=n();return a.ZERO.subTo(this,e),e}function v(){return this.s<0?this.negate():this}function m(e){var t=this.s-e.s;if(0!=t)return t;var r=this.t;if(t=r-e.t,0!=t)return this.s<0?-t:t;for(;--r>=0;)if(0!=(t=this.data[r]-e.data[r]))return t;return 0}function C(e){var t,r=1;return 0!=(t=e>>>16)&&(e=t,r+=16),0!=(t=e>>8)&&(e=t,r+=8),0!=(t=e>>4)&&(e=t,r+=4),0!=(t=e>>2)&&(e=t,r+=2),0!=(t=e>>1)&&(e=t,r+=1),r}function E(){return this.t<=0?0:this.DB*(this.t-1)+C(this.data[this.t-1]^this.s&this.DM)}function S(e,t){var r;for(r=this.t-1;r>=0;--r)t.data[r+e]=this.data[r];for(r=e-1;r>=0;--r)t.data[r]=0;t.t=this.t+e,t.s=this.s}function T(e,t){for(var r=e;r<this.t;++r)t.data[r-e]=this.data[r];t.t=Math.max(this.t-e,0),t.s=this.s}function I(e,t){var r,a=e%this.DB,n=this.DB-a,i=(1<<n)-1,s=Math.floor(e/this.DB),o=this.s<<a&this.DM;for(r=this.t-1;r>=0;--r)t.data[r+s+1]=this.data[r]>>n|o,o=(this.data[r]&i)<<a;for(r=s-1;r>=0;--r)t.data[r]=0;t.data[s]=o,t.t=this.t+s+1,t.s=this.s,t.clamp()}function A(e,t){t.s=this.s;var r=Math.floor(e/this.DB);if(r>=this.t)return void(t.t=0);var a=e%this.DB,n=this.DB-a,i=(1<<a)-1;t.data[0]=this.data[r]>>a;for(var s=r+1;s<this.t;++s)t.data[s-r-1]|=(this.data[s]&i)<<n,t.data[s-r]=this.data[s]>>a;a>0&&(t.data[this.t-r-1]|=(this.s&i)<<n),t.t=this.t-r,t.clamp()}function b(e,t){for(var r=0,a=0,n=Math.min(e.t,this.t);r<n;)a+=this.data[r]-e.data[r],t.data[r++]=a&this.DM,a>>=this.DB;if(e.t<this.t){for(a-=e.s;r<this.t;)a+=this.data[r],t.data[r++]=a&this.DM,a>>=this.DB;a+=this.s}else{for(a+=this.s;r<e.t;)a-=e.data[r],t.data[r++]=a&this.DM,a>>=this.DB;a-=e.s}t.s=a<0?-1:0,a<-1?t.data[r++]=this.DV+a:a>0&&(t.data[r++]=a),t.t=r,t.clamp()}function B(e,t){var r=this.abs(),n=e.abs(),i=r.t;for(t.t=i+n.t;--i>=0;)t.data[i]=0;for(i=0;i<n.t;++i)t.data[i+r.t]=r.am(0,n.data[i],t,i,0,r.t);t.s=0,t.clamp(),this.s!=e.s&&a.ZERO.subTo(t,t)}function N(e){for(var t=this.abs(),r=e.t=2*t.t;--r>=0;)e.data[r]=0;for(r=0;r<t.t-1;++r){var a=t.am(r,t.data[r],e,2*r,0,1);(e.data[r+t.t]+=t.am(r+1,2*t.data[r],e,2*r+1,a,t.t-r-1))>=t.DV&&(e.data[r+t.t]-=t.DV,e.data[r+t.t+1]=1)}e.t>0&&(e.data[e.t-1]+=t.am(r,t.data[r],e,2*r,0,1)),e.s=0,e.clamp()}function k(e,t,r){var i=e.abs();if(!(i.t<=0)){var s=this.abs();if(s.t<i.t)return null!=t&&t.fromInt(0),void(null!=r&&this.copyTo(r));null==r&&(r=n());var o=n(),c=this.s,u=e.s,l=this.DB-C(i.data[i.t-1]);l>0?(i.lShiftTo(l,o),s.lShiftTo(l,r)):(i.copyTo(o),s.copyTo(r));var p=o.t,h=o.data[p-1];if(0!=h){var f=h*(1<<this.F1)+(p>1?o.data[p-2]>>this.F2:0),d=this.FV/f,y=(1<<this.F1)/f,g=1<<this.F2,v=r.t,m=v-p,E=null==t?n():t;for(o.dlShiftTo(m,E),r.compareTo(E)>=0&&(r.data[r.t++]=1,r.subTo(E,r)),a.ONE.dlShiftTo(p,E),E.subTo(o,o);o.t<p;)o.data[o.t++]=0;for(;--m>=0;){var S=r.data[--v]==h?this.DM:Math.floor(r.data[v]*d+(r.data[v-1]+g)*y);if((r.data[v]+=o.am(0,S,r,m,0,p))<S)for(o.dlShiftTo(m,E),r.subTo(E,r);r.data[v]<--S;)r.subTo(E,r)}null!=t&&(r.drShiftTo(p,t),c!=u&&a.ZERO.subTo(t,t)),r.t=p,r.clamp(),l>0&&r.rShiftTo(l,r),c<0&&a.ZERO.subTo(r,r)}}}function R(e){var t=n();return this.abs().divRemTo(e,null,t),this.s<0&&t.compareTo(a.ZERO)>0&&e.subTo(t,t),t}function w(e){this.m=e}function L(e){return e.s<0||e.compareTo(this.m)>=0?e.mod(this.m):e}function _(e){return e}function U(e){e.divRemTo(this.m,null,e)}function D(e,t,r){e.multiplyTo(t,r),this.reduce(r)}function P(e,t){e.squareTo(t),this.reduce(t)}function V(){if(this.t<1)return 0;var e=this.data[0];if(0==(1&e))return 0;var t=3&e;return t=t*(2-(15&e)*t)&15,t=t*(2-(255&e)*t)&255,t=t*(2-((65535&e)*t&65535))&65535,t=t*(2-e*t%this.DV)%this.DV,t>0?this.DV-t:-t}function O(e){this.m=e,this.mp=e.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<e.DB-15)-1,this.mt2=2*e.t}function x(e){var t=n();return e.abs().dlShiftTo(this.m.t,t),t.divRemTo(this.m,null,t),e.s<0&&t.compareTo(a.ZERO)>0&&this.m.subTo(t,t),t}function K(e){var t=n();return e.copyTo(t),this.reduce(t),t}function M(e){for(;e.t<=this.mt2;)e.data[e.t++]=0;for(var t=0;t<this.m.t;++t){var r=32767&e.data[t],a=r*this.mpl+((r*this.mph+(e.data[t]>>15)*this.mpl&this.um)<<15)&e.DM;for(r=t+this.m.t,e.data[r]+=this.m.am(0,a,e,t,0,this.m.t);e.data[r]>=e.DV;)e.data[r]-=e.DV,e.data[++r]++}e.clamp(),e.drShiftTo(this.m.t,e),e.compareTo(this.m)>=0&&e.subTo(this.m,e)}function F(e,t){e.squareTo(t),this.reduce(t)}function q(e,t,r){e.multiplyTo(t,r),this.reduce(r)}function j(){return 0==(this.t>0?1&this.data[0]:this.s)}function H(e,t){if(e>4294967295||e<1)return a.ONE;var r=n(),i=n(),s=t.convert(this),o=C(e)-1;for(s.copyTo(r);--o>=0;)if(t.sqrTo(r,i),(e&1<<o)>0)t.mulTo(i,s,r);else{var c=r;r=i,i=c}return t.revert(r)}function G(e,t){var r;return r=e<256||t.isEven()?new w(t):new O(t),this.exp(e,r)}function Q(){var e=n();return this.copyTo(e),e}function z(){if(this.s<0){if(1==this.t)return this.data[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this.data[0];if(0==this.t)return 0}return(this.data[1]&(1<<32-this.DB)-1)<<this.DB|this.data[0]}function W(){return 0==this.t?this.s:this.data[0]<<24>>24}function X(){return 0==this.t?this.s:this.data[0]<<16>>16}function Y(e){return Math.floor(Math.LN2*this.DB/Math.log(e))}function Z(){return this.s<0?-1:this.t<=0||1==this.t&&this.data[0]<=0?0:1}function J(e){if(null==e&&(e=10),0==this.signum()||e<2||e>36)return"0";var t=this.chunkSize(e),r=Math.pow(e,t),a=h(r),i=n(),s=n(),o="";for(this.divRemTo(a,i,s);i.signum()>0;)o=(r+s.intValue()).toString(e).substr(1)+o,i.divRemTo(a,i,s);return s.intValue().toString(e)+o}function $(e,t){this.fromInt(0),null==t&&(t=10);for(var r=this.chunkSize(t),n=Math.pow(t,r),i=!1,s=0,o=0,c=0;c<e.length;++c){var l=u(e,c);l<0?"-"==e.charAt(c)&&0==this.signum()&&(i=!0):(o=t*o+l,++s>=r&&(this.dMultiply(n),this.dAddOffset(o,0),s=0,o=0))}s>0&&(this.dMultiply(Math.pow(t,s)),this.dAddOffset(o,0)),i&&a.ZERO.subTo(this,this)}function ee(e,t,r){if("number"==typeof t)if(e<2)this.fromInt(1);else for(this.fromNumber(e,r),this.testBit(e-1)||this.bitwiseTo(a.ONE.shiftLeft(e-1),ce,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(t);)this.dAddOffset(2,0),this.bitLength()>e&&this.subTo(a.ONE.shiftLeft(e-1),this);else{var n=new Array,i=7&e;n.length=(e>>3)+1,t.nextBytes(n),i>0?n[0]&=(1<<i)-1:n[0]=0,this.fromString(n,256)}}function te(){var e=this.t,t=new Array;t[0]=this.s;var r,a=this.DB-e*this.DB%8,n=0;if(e-- >0)for(a<this.DB&&(r=this.data[e]>>a)!=(this.s&this.DM)>>a&&(t[n++]=r|this.s<<this.DB-a);e>=0;)a<8?(r=(this.data[e]&(1<<a)-1)<<8-a,r|=this.data[--e]>>(a+=this.DB-8)):(r=this.data[e]>>(a-=8)&255,a<=0&&(a+=this.DB,--e)),0!=(128&r)&&(r|=-256),0==n&&(128&this.s)!=(128&r)&&++n,(n>0||r!=this.s)&&(t[n++]=r);return t}function re(e){return 0==this.compareTo(e)}function ae(e){return this.compareTo(e)<0?this:e}function ne(e){return this.compareTo(e)>0?this:e}function ie(e,t,r){var a,n,i=Math.min(e.t,this.t);for(a=0;a<i;++a)r.data[a]=t(this.data[a],e.data[a]);if(e.t<this.t){for(n=e.s&this.DM,a=i;a<this.t;++a)r.data[a]=t(this.data[a],n);r.t=this.t}else{for(n=this.s&this.DM,a=i;a<e.t;++a)r.data[a]=t(n,e.data[a]);r.t=e.t}r.s=t(this.s,e.s),r.clamp()}function se(e,t){return e&t}function oe(e){var t=n();return this.bitwiseTo(e,se,t),t}function ce(e,t){return e|t}function ue(e){var t=n();return this.bitwiseTo(e,ce,t),t}function le(e,t){return e^t}function pe(e){var t=n();return this.bitwiseTo(e,le,t),t}function he(e,t){return e&~t}function fe(e){var t=n();return this.bitwiseTo(e,he,t),t}function de(){for(var e=n(),t=0;t<this.t;++t)e.data[t]=this.DM&~this.data[t];return e.t=this.t,e.s=~this.s,e}function ye(e){var t=n();return e<0?this.rShiftTo(-e,t):this.lShiftTo(e,t),t}function ge(e){var t=n();return e<0?this.lShiftTo(-e,t):this.rShiftTo(e,t),t}function ve(e){if(0==e)return-1;var t=0;return 0==(65535&e)&&(e>>=16,t+=16),0==(255&e)&&(e>>=8,t+=8),0==(15&e)&&(e>>=4,t+=4),0==(3&e)&&(e>>=2,t+=2),0==(1&e)&&++t,t}function me(){for(var e=0;e<this.t;++e)if(0!=this.data[e])return e*this.DB+ve(this.data[e]);return this.s<0?this.t*this.DB:-1}function Ce(e){for(var t=0;0!=e;)e&=e-1,++t;return t}function Ee(){for(var e=0,t=this.s&this.DM,r=0;r<this.t;++r)e+=Ce(this.data[r]^t);return e}function Se(e){var t=Math.floor(e/this.DB);return t>=this.t?0!=this.s:0!=(this.data[t]&1<<e%this.DB)}function Te(e,t){var r=a.ONE.shiftLeft(e);return this.bitwiseTo(r,t,r),r}function Ie(e){return this.changeBit(e,ce)}function Ae(e){return this.changeBit(e,he)}function be(e){return this.changeBit(e,le)}function Be(e,t){for(var r=0,a=0,n=Math.min(e.t,this.t);r<n;)a+=this.data[r]+e.data[r],t.data[r++]=a&this.DM,a>>=this.DB;if(e.t<this.t){for(a+=e.s;r<this.t;)a+=this.data[r],t.data[r++]=a&this.DM,a>>=this.DB;a+=this.s}else{for(a+=this.s;r<e.t;)a+=e.data[r],t.data[r++]=a&this.DM,a>>=this.DB;a+=e.s}t.s=a<0?-1:0,a>0?t.data[r++]=a:a<-1&&(t.data[r++]=this.DV+a),t.t=r,t.clamp()}function Ne(e){var t=n();return this.addTo(e,t),t}function ke(e){var t=n();return this.subTo(e,t),t}function Re(e){var t=n();return this.multiplyTo(e,t),t}function we(e){var t=n();return this.divRemTo(e,t,null),t}function Le(e){var t=n();return this.divRemTo(e,null,t),t}function _e(e){var t=n(),r=n();return this.divRemTo(e,t,r),new Array(t,r)}function Ue(e){this.data[this.t]=this.am(0,e-1,this,0,0,this.t),++this.t,this.clamp()}function De(e,t){if(0!=e){for(;this.t<=t;)this.data[this.t++]=0;for(this.data[t]+=e;this.data[t]>=this.DV;)this.data[t]-=this.DV,++t>=this.t&&(this.data[this.t++]=0),++this.data[t]}}function Pe(){}function Ve(e){return e}function Oe(e,t,r){e.multiplyTo(t,r)}function xe(e,t){e.squareTo(t)}function Ke(e){return this.exp(e,new Pe)}function Me(e,t,r){var a=Math.min(this.t+e.t,t);for(r.s=0,r.t=a;a>0;)r.data[--a]=0;var n;for(n=r.t-this.t;a<n;++a)r.data[a+this.t]=this.am(0,e.data[a],r,a,0,this.t);for(n=Math.min(e.t,t);a<n;++a)this.am(0,e.data[a],r,a,0,t-a);r.clamp()}function Fe(e,t,r){--t;var a=r.t=this.t+e.t-t;for(r.s=0;--a>=0;)r.data[a]=0;for(a=Math.max(t-this.t,0);a<e.t;++a)r.data[this.t+a-t]=this.am(t-a,e.data[a],r,0,0,this.t+a-t);r.clamp(),r.drShiftTo(1,r)}function qe(e){this.r2=n(),this.q3=n(),a.ONE.dlShiftTo(2*e.t,this.r2),this.mu=this.r2.divide(e),this.m=e}function je(e){if(e.s<0||e.t>2*this.m.t)return e.mod(this.m);if(e.compareTo(this.m)<0)return e;var t=n();return e.copyTo(t),this.reduce(t),t}function He(e){return e}function Ge(e){for(e.drShiftTo(this.m.t-1,this.r2),e.t>this.m.t+1&&(e.t=this.m.t+1,e.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);e.compareTo(this.r2)<0;)e.dAddOffset(1,this.m.t+1);for(e.subTo(this.r2,e);e.compareTo(this.m)>=0;)e.subTo(this.m,e)}function Qe(e,t){e.squareTo(t),this.reduce(t)}function ze(e,t,r){e.multiplyTo(t,r),this.reduce(r)}function We(e,t){var r,a,i=e.bitLength(),s=h(1);if(i<=0)return s;r=i<18?1:i<48?3:i<144?4:i<768?5:6,a=i<8?new w(t):t.isEven()?new qe(t):new O(t);var o=new Array,c=3,u=r-1,l=(1<<r)-1;if(o[1]=a.convert(this),r>1){var p=n();for(a.sqrTo(o[1],p);c<=l;)o[c]=n(),a.mulTo(p,o[c-2],o[c]),c+=2}var f,d,y=e.t-1,g=!0,v=n();for(i=C(e.data[y])-1;y>=0;){for(i>=u?f=e.data[y]>>i-u&l:(f=(e.data[y]&(1<<i+1)-1)<<u-i,y>0&&(f|=e.data[y-1]>>this.DB+i-u)),c=r;0==(1&f);)f>>=1,--c;if((i-=c)<0&&(i+=this.DB,--y),g)o[f].copyTo(s),g=!1;else{for(;c>1;)a.sqrTo(s,v),a.sqrTo(v,s),c-=2;c>0?a.sqrTo(s,v):(d=s,s=v,v=d),a.mulTo(v,o[f],s)}for(;y>=0&&0==(e.data[y]&1<<i);)a.sqrTo(s,v),d=s,s=v,v=d,--i<0&&(i=this.DB-1,--y)}return a.revert(s)}function Xe(e){var t=this.s<0?this.negate():this.clone(),r=e.s<0?e.negate():e.clone();if(t.compareTo(r)<0){var a=t;t=r,r=a}var n=t.getLowestSetBit(),i=r.getLowestSetBit();if(i<0)return t;for(n<i&&(i=n),i>0&&(t.rShiftTo(i,t),r.rShiftTo(i,r));t.signum()>0;)(n=t.getLowestSetBit())>0&&t.rShiftTo(n,t),(n=r.getLowestSetBit())>0&&r.rShiftTo(n,r),t.compareTo(r)>=0?(t.subTo(r,t),t.rShiftTo(1,t)):(r.subTo(t,r),r.rShiftTo(1,r));return i>0&&r.lShiftTo(i,r),r}function Ye(e){if(e<=0)return 0;var t=this.DV%e,r=this.s<0?e-1:0;if(this.t>0)if(0==t)r=this.data[0]%e;else for(var a=this.t-1;a>=0;--a)r=(t*r+this.data[a])%e;return r}function Ze(e){var t=e.isEven();if(this.isEven()&&t||0==e.signum())return a.ZERO;for(var r=e.clone(),n=this.clone(),i=h(1),s=h(0),o=h(0),c=h(1);0!=r.signum();){for(;r.isEven();)r.rShiftTo(1,r),t?(i.isEven()&&s.isEven()||(i.addTo(this,i),s.subTo(e,s)),i.rShiftTo(1,i)):s.isEven()||s.subTo(e,s),s.rShiftTo(1,s);for(;n.isEven();)n.rShiftTo(1,n),t?(o.isEven()&&c.isEven()||(o.addTo(this,o),c.subTo(e,c)),o.rShiftTo(1,o)):c.isEven()||c.subTo(e,c),c.rShiftTo(1,c);r.compareTo(n)>=0?(r.subTo(n,r),t&&i.subTo(o,i),s.subTo(c,s)):(n.subTo(r,n),t&&o.subTo(i,o),c.subTo(s,c))}return 0!=n.compareTo(a.ONE)?a.ZERO:c.compareTo(e)>=0?c.subtract(e):c.signum()<0?(c.addTo(e,c),c.signum()<0?c.add(e):c):c}function Je(e){var t,r=this.abs();if(1==r.t&&r.data[0]<=lt[lt.length-1]){for(t=0;t<lt.length;++t)if(r.data[0]==lt[t])return!0;return!1}if(r.isEven())return!1;for(t=1;t<lt.length;){for(var a=lt[t],n=t+1;n<lt.length&&a<pt;)a*=lt[n++];for(a=r.modInt(a);t<n;)if(a%lt[t++]==0)return!1}return r.millerRabin(e)}function $e(e){var t=this.subtract(a.ONE),r=t.getLowestSetBit();if(r<=0)return!1;for(var n,i=t.shiftRight(r),s=et(),o=0;o<e;++o){do n=new a(this.bitLength(),s);while(n.compareTo(a.ONE)<=0||n.compareTo(t)>=0);var c=n.modPow(i,this);if(0!=c.compareTo(a.ONE)&&0!=c.compareTo(t)){for(var u=1;u++<r&&0!=c.compareTo(t);)if(c=c.modPowInt(2,this),0==c.compareTo(a.ONE))return!1;if(0!=c.compareTo(t))return!1}}return!0}function et(){return{nextBytes:function(e){for(var t=0;t<e.length;++t)e[t]=Math.floor(256*Math.random())}}}var tt=r(0);e.exports=tt.jsbn=tt.jsbn||{};var rt,at=0xdeadbeefcafe,nt=15715070==(16777215&at);tt.jsbn.BigInteger=a,"undefined"==typeof navigator?(a.prototype.am=o,rt=28):nt&&"Microsoft Internet Explorer"==navigator.appName?(a.prototype.am=s,rt=30):nt&&"Netscape"!=navigator.appName?(a.prototype.am=i,rt=26):(a.prototype.am=o,rt=28),a.prototype.DB=rt,a.prototype.DM=(1<<rt)-1,a.prototype.DV=1<<rt;var it=52;a.prototype.FV=Math.pow(2,it),a.prototype.F1=it-rt,a.prototype.F2=2*rt-it;var st,ot,ct="0123456789abcdefghijklmnopqrstuvwxyz",ut=new Array;for(st="0".charCodeAt(0),ot=0;ot<=9;++ot)ut[st++]=ot;for(st="a".charCodeAt(0),ot=10;ot<36;++ot)ut[st++]=ot;for(st="A".charCodeAt(0),ot=10;ot<36;++ot)ut[st++]=ot;w.prototype.convert=L,w.prototype.revert=_,w.prototype.reduce=U,w.prototype.mulTo=D,w.prototype.sqrTo=P,O.prototype.convert=x,O.prototype.revert=K,O.prototype.reduce=M,O.prototype.mulTo=q,O.prototype.sqrTo=F,a.prototype.copyTo=l,a.prototype.fromInt=p,
a.prototype.fromString=f,a.prototype.clamp=d,a.prototype.dlShiftTo=S,a.prototype.drShiftTo=T,a.prototype.lShiftTo=I,a.prototype.rShiftTo=A,a.prototype.subTo=b,a.prototype.multiplyTo=B,a.prototype.squareTo=N,a.prototype.divRemTo=k,a.prototype.invDigit=V,a.prototype.isEven=j,a.prototype.exp=H,a.prototype.toString=y,a.prototype.negate=g,a.prototype.abs=v,a.prototype.compareTo=m,a.prototype.bitLength=E,a.prototype.mod=R,a.prototype.modPowInt=G,a.ZERO=h(0),a.ONE=h(1),Pe.prototype.convert=Ve,Pe.prototype.revert=Ve,Pe.prototype.mulTo=Oe,Pe.prototype.sqrTo=xe,qe.prototype.convert=je,qe.prototype.revert=He,qe.prototype.reduce=Ge,qe.prototype.mulTo=ze,qe.prototype.sqrTo=Qe;var lt=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509],pt=(1<<26)/lt[lt.length-1];a.prototype.chunkSize=Y,a.prototype.toRadix=J,a.prototype.fromRadix=$,a.prototype.fromNumber=ee,a.prototype.bitwiseTo=ie,a.prototype.changeBit=Te,a.prototype.addTo=Be,a.prototype.dMultiply=Ue,a.prototype.dAddOffset=De,a.prototype.multiplyLowerTo=Me,a.prototype.multiplyUpperTo=Fe,a.prototype.modInt=Ye,a.prototype.millerRabin=$e,a.prototype.clone=Q,a.prototype.intValue=z,a.prototype.byteValue=W,a.prototype.shortValue=X,a.prototype.signum=Z,a.prototype.toByteArray=te,a.prototype.equals=re,a.prototype.min=ae,a.prototype.max=ne,a.prototype.and=oe,a.prototype.or=ue,a.prototype.xor=pe,a.prototype.andNot=fe,a.prototype.not=de,a.prototype.shiftLeft=ye,a.prototype.shiftRight=ge,a.prototype.getLowestSetBit=me,a.prototype.bitCount=Ee,a.prototype.testBit=Se,a.prototype.setBit=Ie,a.prototype.clearBit=Ae,a.prototype.flipBit=be,a.prototype.add=Ne,a.prototype.subtract=ke,a.prototype.multiply=Re,a.prototype.divide=we,a.prototype.remainder=Le,a.prototype.divideAndRemainder=_e,a.prototype.modPow=We,a.prototype.modInverse=Ze,a.prototype.pow=Ke,a.prototype.gcd=Xe,a.prototype.isProbablePrime=Je},function(e,t,r){function a(){o=String.fromCharCode(128),o+=i.util.fillString(String.fromCharCode(0),64),c=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12,5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2,0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9],u=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21],l=new Array(64);for(var e=0;e<64;++e)l[e]=Math.floor(4294967296*Math.abs(Math.sin(e+1)));p=!0}function n(e,t,r){for(var a,n,i,s,o,p,h,f,d=r.length();d>=64;){for(n=e.h0,i=e.h1,s=e.h2,o=e.h3,f=0;f<16;++f)t[f]=r.getInt32Le(),p=o^i&(s^o),a=n+p+l[f]+t[f],h=u[f],n=o,o=s,s=i,i+=a<<h|a>>>32-h;for(;f<32;++f)p=s^o&(i^s),a=n+p+l[f]+t[c[f]],h=u[f],n=o,o=s,s=i,i+=a<<h|a>>>32-h;for(;f<48;++f)p=i^s^o,a=n+p+l[f]+t[c[f]],h=u[f],n=o,o=s,s=i,i+=a<<h|a>>>32-h;for(;f<64;++f)p=s^(i|~o),a=n+p+l[f]+t[c[f]],h=u[f],n=o,o=s,s=i,i+=a<<h|a>>>32-h;e.h0=e.h0+n|0,e.h1=e.h1+i|0,e.h2=e.h2+s|0,e.h3=e.h3+o|0,d-=64}}var i=r(0);r(4),r(1);var s=e.exports=i.md5=i.md5||{};i.md.md5=i.md.algorithms.md5=s,s.create=function(){p||a();var e=null,t=i.util.createBuffer(),r=new Array(16),s={algorithm:"md5",blockLength:64,digestLength:16,messageLength:0,fullMessageLength:null,messageLengthSize:8};return s.start=function(){s.messageLength=0,s.fullMessageLength=s.messageLength64=[];for(var r=s.messageLengthSize/4,a=0;a<r;++a)s.fullMessageLength.push(0);return t=i.util.createBuffer(),e={h0:1732584193,h1:4023233417,h2:2562383102,h3:271733878},s},s.start(),s.update=function(a,o){"utf8"===o&&(a=i.util.encodeUtf8(a));var c=a.length;s.messageLength+=c,c=[c/4294967296>>>0,c>>>0];for(var u=s.fullMessageLength.length-1;u>=0;--u)s.fullMessageLength[u]+=c[1],c[1]=c[0]+(s.fullMessageLength[u]/4294967296>>>0),s.fullMessageLength[u]=s.fullMessageLength[u]>>>0,c[0]=c[1]/4294967296>>>0;return t.putBytes(a),n(e,r,t),(t.read>2048||0===t.length())&&t.compact(),s},s.digest=function(){var a=i.util.createBuffer();a.putBytes(t.bytes());var c=s.fullMessageLength[s.fullMessageLength.length-1]+s.messageLengthSize,u=c&s.blockLength-1;a.putBytes(o.substr(0,s.blockLength-u));for(var l,p=0,h=s.fullMessageLength.length-1;h>=0;--h)l=8*s.fullMessageLength[h]+p,p=l/4294967296>>>0,a.putInt32Le(l>>>0);var f={h0:e.h0,h1:e.h1,h2:e.h2,h3:e.h3};n(f,r,a);var d=i.util.createBuffer();return d.putInt32Le(f.h0),d.putInt32Le(f.h1),d.putInt32Le(f.h2),d.putInt32Le(f.h3),d},s};var o=null,c=null,u=null,l=null,p=!1},function(e,t,r){var a=r(0);r(8),r(4),r(1);var n,i=a.pkcs5=a.pkcs5||{};a.util.isNodejs&&!a.options.usePureJavaScript&&(n=r(32)),e.exports=a.pbkdf2=i.pbkdf2=function(e,t,r,i,s,o){function c(){return C>h?o(null,m):(d.start(null,null),d.update(t),d.update(a.util.int32ToBytes(C)),y=v=d.digest().getBytes(),E=2,void u())}function u(){return E<=r?(d.start(null,null),d.update(v),g=d.digest().getBytes(),y=a.util.xorBytes(y,g,l),v=g,++E,a.util.setImmediate(u)):(m+=C<h?y:y.substr(0,f),++C,void c())}if("function"==typeof s&&(o=s,s=null),a.util.isNodejs&&!a.options.usePureJavaScript&&n.pbkdf2&&(null===s||"object"!=typeof s)&&(n.pbkdf2Sync.length>4||!s||"sha1"===s))return"string"!=typeof s&&(s="sha1"),e=new Buffer(e,"binary"),t=new Buffer(t,"binary"),o?4===n.pbkdf2Sync.length?n.pbkdf2(e,t,r,i,function(e,t){return e?o(e):void o(null,t.toString("binary"))}):n.pbkdf2(e,t,r,i,s,function(e,t){return e?o(e):void o(null,t.toString("binary"))}):4===n.pbkdf2Sync.length?n.pbkdf2Sync(e,t,r,i).toString("binary"):n.pbkdf2Sync(e,t,r,i,s).toString("binary");if("undefined"!=typeof s&&null!==s||(s="sha1"),"string"==typeof s){if(!(s in a.md.algorithms))throw new Error("Unknown hash algorithm: "+s);s=a.md[s].create()}var l=s.digestLength;if(i>4294967295*l){var p=new Error("Derived key is too long.");if(o)return o(p);throw p}var h=Math.ceil(i/l),f=i-(h-1)*l,d=a.hmac.create();d.start(s,e);var y,g,v,m="";if(!o){for(var C=1;C<=h;++C){d.start(null,null),d.update(t),d.update(a.util.int32ToBytes(C)),y=v=d.digest().getBytes();for(var E=2;E<=r;++E)d.start(null,null),d.update(v),g=d.digest().getBytes(),y=a.util.xorBytes(y,g,l),v=g;m+=C<h?y:y.substr(0,f)}return m}var E,C=1;c()}},function(e,t,r){var a=r(0);r(2),r(1);var n=e.exports=a.pss=a.pss||{};n.create=function(e){3===arguments.length&&(e={md:arguments[0],mgf:arguments[1],saltLength:arguments[2]});var t=e.md,r=e.mgf,n=t.digestLength,i=e.salt||null;"string"==typeof i&&(i=a.util.createBuffer(i));var s;if("saltLength"in e)s=e.saltLength;else{if(null===i)throw new Error("Salt length not specified or specific salt not given.");s=i.length()}if(null!==i&&i.length()!==s)throw new Error("Given salt length does not match length of given salt.");var o=e.prng||a.random,c={};return c.encode=function(e,c){var u,l=c-1,p=Math.ceil(l/8),h=e.digest().getBytes();if(p<n+s+2)throw new Error("Message is too long to encrypt.");var f;f=null===i?o.getBytesSync(s):i.bytes();var d=new a.util.ByteBuffer;d.fillWithByte(0,8),d.putBytes(h),d.putBytes(f),t.start(),t.update(d.getBytes());var y=t.digest().getBytes(),g=new a.util.ByteBuffer;g.fillWithByte(0,p-s-n-2),g.putByte(1),g.putBytes(f);var v=g.getBytes(),m=p-n-1,C=r.generate(y,m),E="";for(u=0;u<m;u++)E+=String.fromCharCode(v.charCodeAt(u)^C.charCodeAt(u));var S=65280>>8*p-l&255;return E=String.fromCharCode(E.charCodeAt(0)&~S)+E.substr(1),E+y+String.fromCharCode(188)},c.verify=function(e,i,o){var c,u=o-1,l=Math.ceil(u/8);if(i=i.substr(-l),l<n+s+2)throw new Error("Inconsistent parameters to PSS signature verification.");if(188!==i.charCodeAt(l-1))throw new Error("Encoded message does not end in 0xBC.");var p=l-n-1,h=i.substr(0,p),f=i.substr(p,n),d=65280>>8*l-u&255;if(0!==(h.charCodeAt(0)&d))throw new Error("Bits beyond keysize not zero as expected.");var y=r.generate(f,p),g="";for(c=0;c<p;c++)g+=String.fromCharCode(h.charCodeAt(c)^y.charCodeAt(c));g=String.fromCharCode(g.charCodeAt(0)&~d)+g.substr(1);var v=l-n-s-2;for(c=0;c<v;c++)if(0!==g.charCodeAt(c))throw new Error("Leftmost octets not zero as expected");if(1!==g.charCodeAt(v))throw new Error("Inconsistent PSS signature, 0x01 marker not found");var m=g.substr(-s),C=new a.util.ByteBuffer;C.fillWithByte(0,8),C.putBytes(e),C.putBytes(m),t.start(),t.update(C.getBytes());var E=t.digest().getBytes();return f===E},c}},function(e,t,r){function a(e,t){"string"==typeof t&&(t={shortName:t});for(var r,a=null,n=0;null===a&&n<e.attributes.length;++n)r=e.attributes[n],t.type&&t.type===r.type?a=r:t.name&&t.name===r.name?a=r:t.shortName&&t.shortName===r.shortName&&(a=r);return a}function n(e){for(var t,r,a=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]),n=e.attributes,i=0;i<n.length;++i){t=n[i];var s=t.value,o=l.Type.PRINTABLESTRING;"valueTagClass"in t&&(o=t.valueTagClass,o===l.Type.UTF8&&(s=u.util.encodeUtf8(s))),r=l.create(l.Class.UNIVERSAL,l.Type.SET,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(t.type).getBytes()),l.create(l.Class.UNIVERSAL,o,!1,s)])]),a.value.push(r)}return a}function i(e){for(var t,r=0;r<e.length;++r){if(t=e[r],"undefined"==typeof t.name&&(t.type&&t.type in p.oids?t.name=p.oids[t.type]:t.shortName&&t.shortName in f&&(t.name=p.oids[f[t.shortName]])),"undefined"==typeof t.type){if(!(t.name&&t.name in p.oids)){var a=new Error("Attribute type not specified.");throw a.attribute=t,a}t.type=p.oids[t.name]}if("undefined"==typeof t.shortName&&t.name&&t.name in f&&(t.shortName=f[t.name]),t.type===h.extensionRequest&&(t.valueConstructed=!0,t.valueTagClass=l.Type.SEQUENCE,!t.value&&t.extensions)){t.value=[];for(var n=0;n<t.extensions.length;++n)t.value.push(p.certificateExtensionToAsn1(s(t.extensions[n])))}if("undefined"==typeof t.value){var a=new Error("Attribute value not specified.");throw a.attribute=t,a}}}function s(e,t){if(t=t||{},"undefined"==typeof e.name&&e.id&&e.id in p.oids&&(e.name=p.oids[e.id]),"undefined"==typeof e.id){if(!(e.name&&e.name in p.oids)){var r=new Error("Extension ID not specified.");throw r.extension=e,r}e.id=p.oids[e.name]}if("undefined"!=typeof e.value)return e;if("keyUsage"===e.name){var a=0,i=0,s=0;e.digitalSignature&&(i|=128,a=7),e.nonRepudiation&&(i|=64,a=6),e.keyEncipherment&&(i|=32,a=5),e.dataEncipherment&&(i|=16,a=4),e.keyAgreement&&(i|=8,a=3),e.keyCertSign&&(i|=4,a=2),e.cRLSign&&(i|=2,a=1),e.encipherOnly&&(i|=1,a=0),e.decipherOnly&&(s|=128,a=7);var o=String.fromCharCode(a);0!==s?o+=String.fromCharCode(i)+String.fromCharCode(s):0!==i&&(o+=String.fromCharCode(i)),e.value=l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,o)}else if("basicConstraints"===e.name)e.value=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]),e.cA&&e.value.value.push(l.create(l.Class.UNIVERSAL,l.Type.BOOLEAN,!1,String.fromCharCode(255))),"pathLenConstraint"in e&&e.value.value.push(l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(e.pathLenConstraint).getBytes()));else if("extKeyUsage"===e.name){e.value=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);var c=e.value.value;for(var f in e)e[f]===!0&&(f in h?c.push(l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(h[f]).getBytes())):f.indexOf(".")!==-1&&c.push(l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(f).getBytes())))}else if("nsCertType"===e.name){var a=0,i=0;e.client&&(i|=128,a=7),e.server&&(i|=64,a=6),e.email&&(i|=32,a=5),e.objsign&&(i|=16,a=4),e.reserved&&(i|=8,a=3),e.sslCA&&(i|=4,a=2),e.emailCA&&(i|=2,a=1),e.objCA&&(i|=1,a=0);var o=String.fromCharCode(a);0!==i&&(o+=String.fromCharCode(i)),e.value=l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,o)}else if("subjectAltName"===e.name||"issuerAltName"===e.name){e.value=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);for(var d,y=0;y<e.altNames.length;++y){d=e.altNames[y];var o=d.value;if(7===d.type&&d.ip){if(o=u.util.bytesFromIP(d.ip),null===o){var r=new Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');throw r.extension=e,r}}else 8===d.type&&(o=d.oid?l.oidToDer(l.oidToDer(d.oid)):l.oidToDer(o));e.value.value.push(l.create(l.Class.CONTEXT_SPECIFIC,d.type,!1,o))}}else if("subjectKeyIdentifier"===e.name&&t.cert){var g=t.cert.generateSubjectKeyIdentifier();e.subjectKeyIdentifier=g.toHex(),e.value=l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,g.getBytes())}else if("authorityKeyIdentifier"===e.name&&t.cert){e.value=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);var c=e.value.value;if(e.keyIdentifier){var v=e.keyIdentifier===!0?t.cert.generateSubjectKeyIdentifier().getBytes():e.keyIdentifier;c.push(l.create(l.Class.CONTEXT_SPECIFIC,0,!1,v))}if(e.authorityCertIssuer){var m=[l.create(l.Class.CONTEXT_SPECIFIC,4,!0,[n(e.authorityCertIssuer===!0?t.cert.issuer:e.authorityCertIssuer)])];c.push(l.create(l.Class.CONTEXT_SPECIFIC,1,!0,m))}if(e.serialNumber){var C=u.util.hexToBytes(e.serialNumber===!0?t.cert.serialNumber:e.serialNumber);c.push(l.create(l.Class.CONTEXT_SPECIFIC,2,!1,C))}}else if("cRLDistributionPoints"===e.name){e.value=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);for(var d,c=e.value.value,E=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]),S=l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[]),y=0;y<e.altNames.length;++y){d=e.altNames[y];var o=d.value;if(7===d.type&&d.ip){if(o=u.util.bytesFromIP(d.ip),null===o){var r=new Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');throw r.extension=e,r}}else 8===d.type&&(o=d.oid?l.oidToDer(l.oidToDer(d.oid)):l.oidToDer(o));S.value.push(l.create(l.Class.CONTEXT_SPECIFIC,d.type,!1,o))}E.value.push(l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[S])),c.push(E)}if("undefined"==typeof e.value){var r=new Error("Extension value not specified.");throw r.extension=e,r}return e}function o(e,t){switch(e){case h["RSASSA-PSS"]:var r=[];return void 0!==t.hash.algorithmOid&&r.push(l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(t.hash.algorithmOid).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.NULL,!1,"")])])),void 0!==t.mgf.algorithmOid&&r.push(l.create(l.Class.CONTEXT_SPECIFIC,1,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(t.mgf.algorithmOid).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(t.mgf.hash.algorithmOid).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.NULL,!1,"")])])])),void 0!==t.saltLength&&r.push(l.create(l.Class.CONTEXT_SPECIFIC,2,!0,[l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(t.saltLength).getBytes())])),l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,r);default:return l.create(l.Class.UNIVERSAL,l.Type.NULL,!1,"")}}function c(e){var t=l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[]);if(0===e.attributes.length)return t;for(var r=e.attributes,a=0;a<r.length;++a){var n=r[a],i=n.value,s=l.Type.UTF8;"valueTagClass"in n&&(s=n.valueTagClass),s===l.Type.UTF8&&(i=u.util.encodeUtf8(i));var o=!1;"valueConstructed"in n&&(o=n.valueConstructed);var c=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(n.type).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.SET,!0,[l.create(l.Class.UNIVERSAL,s,o,i)])]);t.value.push(c)}return t}var u=r(0);r(5),r(3),r(10),r(4),r(37),r(6),r(7),r(16),r(11),r(1);var l=u.asn1,p=e.exports=u.pki=u.pki||{},h=p.oids,f={};f.CN=h.commonName,f.commonName="CN",f.C=h.countryName,f.countryName="C",f.L=h.localityName,f.localityName="L",f.ST=h.stateOrProvinceName,f.stateOrProvinceName="ST",f.O=h.organizationName,f.organizationName="O",f.OU=h.organizationalUnitName,f.organizationalUnitName="OU",f.E=h.emailAddress,f.emailAddress="E";var d=u.pki.rsa.publicKeyValidator,y={name:"Certificate",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"Certificate.TBSCertificate",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"tbsCertificate",value:[{name:"Certificate.TBSCertificate.version",tagClass:l.Class.CONTEXT_SPECIFIC,type:0,constructed:!0,optional:!0,value:[{name:"Certificate.TBSCertificate.version.integer",tagClass:l.Class.UNIVERSAL,type:l.Type.INTEGER,constructed:!1,capture:"certVersion"}]},{name:"Certificate.TBSCertificate.serialNumber",tagClass:l.Class.UNIVERSAL,type:l.Type.INTEGER,constructed:!1,capture:"certSerialNumber"},{name:"Certificate.TBSCertificate.signature",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"Certificate.TBSCertificate.signature.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"certinfoSignatureOid"},{name:"Certificate.TBSCertificate.signature.parameters",tagClass:l.Class.UNIVERSAL,optional:!0,captureAsn1:"certinfoSignatureParams"}]},{name:"Certificate.TBSCertificate.issuer",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"certIssuer"},{name:"Certificate.TBSCertificate.validity",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"Certificate.TBSCertificate.validity.notBefore (utc)",tagClass:l.Class.UNIVERSAL,type:l.Type.UTCTIME,constructed:!1,optional:!0,capture:"certValidity1UTCTime"},{name:"Certificate.TBSCertificate.validity.notBefore (generalized)",tagClass:l.Class.UNIVERSAL,type:l.Type.GENERALIZEDTIME,constructed:!1,optional:!0,capture:"certValidity2GeneralizedTime"},{name:"Certificate.TBSCertificate.validity.notAfter (utc)",tagClass:l.Class.UNIVERSAL,type:l.Type.UTCTIME,constructed:!1,optional:!0,capture:"certValidity3UTCTime"},{name:"Certificate.TBSCertificate.validity.notAfter (generalized)",tagClass:l.Class.UNIVERSAL,type:l.Type.GENERALIZEDTIME,constructed:!1,optional:!0,capture:"certValidity4GeneralizedTime"}]},{name:"Certificate.TBSCertificate.subject",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"certSubject"},d,{name:"Certificate.TBSCertificate.issuerUniqueID",tagClass:l.Class.CONTEXT_SPECIFIC,type:1,constructed:!0,optional:!0,value:[{name:"Certificate.TBSCertificate.issuerUniqueID.id",tagClass:l.Class.UNIVERSAL,type:l.Type.BITSTRING,constructed:!1,captureBitStringValue:"certIssuerUniqueId"}]},{name:"Certificate.TBSCertificate.subjectUniqueID",tagClass:l.Class.CONTEXT_SPECIFIC,type:2,constructed:!0,optional:!0,value:[{name:"Certificate.TBSCertificate.subjectUniqueID.id",tagClass:l.Class.UNIVERSAL,type:l.Type.BITSTRING,constructed:!1,captureBitStringValue:"certSubjectUniqueId"}]},{name:"Certificate.TBSCertificate.extensions",tagClass:l.Class.CONTEXT_SPECIFIC,type:3,constructed:!0,captureAsn1:"certExtensions",optional:!0}]},{name:"Certificate.signatureAlgorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"Certificate.signatureAlgorithm.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"certSignatureOid"},{name:"Certificate.TBSCertificate.signature.parameters",tagClass:l.Class.UNIVERSAL,optional:!0,captureAsn1:"certSignatureParams"}]},{name:"Certificate.signatureValue",tagClass:l.Class.UNIVERSAL,type:l.Type.BITSTRING,constructed:!1,captureBitStringValue:"certSignature"}]},g={name:"rsapss",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"rsapss.hashAlgorithm",tagClass:l.Class.CONTEXT_SPECIFIC,type:0,constructed:!0,value:[{name:"rsapss.hashAlgorithm.AlgorithmIdentifier",tagClass:l.Class.UNIVERSAL,type:l.Class.SEQUENCE,constructed:!0,optional:!0,value:[{name:"rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"hashOid"}]}]},{name:"rsapss.maskGenAlgorithm",tagClass:l.Class.CONTEXT_SPECIFIC,type:1,constructed:!0,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier",tagClass:l.Class.UNIVERSAL,type:l.Class.SEQUENCE,constructed:!0,optional:!0,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"maskGenOid"},{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"maskGenHashOid"}]}]}]},{name:"rsapss.saltLength",tagClass:l.Class.CONTEXT_SPECIFIC,type:2,optional:!0,value:[{name:"rsapss.saltLength.saltLength",tagClass:l.Class.UNIVERSAL,type:l.Class.INTEGER,constructed:!1,capture:"saltLength"}]},{name:"rsapss.trailerField",tagClass:l.Class.CONTEXT_SPECIFIC,type:3,optional:!0,value:[{name:"rsapss.trailer.trailer",tagClass:l.Class.UNIVERSAL,type:l.Class.INTEGER,constructed:!1,capture:"trailer"}]}]},v={name:"CertificationRequestInfo",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"certificationRequestInfo",value:[{name:"CertificationRequestInfo.integer",tagClass:l.Class.UNIVERSAL,type:l.Type.INTEGER,constructed:!1,capture:"certificationRequestInfoVersion"},{name:"CertificationRequestInfo.subject",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"certificationRequestInfoSubject"},d,{name:"CertificationRequestInfo.attributes",tagClass:l.Class.CONTEXT_SPECIFIC,type:0,constructed:!0,optional:!0,capture:"certificationRequestInfoAttributes",value:[{name:"CertificationRequestInfo.attributes",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"CertificationRequestInfo.attributes.type",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1},{name:"CertificationRequestInfo.attributes.value",tagClass:l.Class.UNIVERSAL,type:l.Type.SET,constructed:!0}]}]}]},m={name:"CertificationRequest",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,captureAsn1:"csr",value:[v,{name:"CertificationRequest.signatureAlgorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"CertificationRequest.signatureAlgorithm.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"csrSignatureOid"},{name:"CertificationRequest.signatureAlgorithm.parameters",tagClass:l.Class.UNIVERSAL,optional:!0,captureAsn1:"csrSignatureParams"}]},{name:"CertificationRequest.signature",tagClass:l.Class.UNIVERSAL,type:l.Type.BITSTRING,constructed:!1,captureBitStringValue:"csrSignature"}]};p.RDNAttributesAsArray=function(e,t){for(var r,a,n,i=[],s=0;s<e.value.length;++s){r=e.value[s];for(var o=0;o<r.value.length;++o)n={},a=r.value[o],n.type=l.derToOid(a.value[0].value),n.value=a.value[1].value,n.valueTagClass=a.value[1].type,n.type in h&&(n.name=h[n.type],n.name in f&&(n.shortName=f[n.name])),t&&(t.update(n.type),t.update(n.value)),i.push(n)}return i},p.CRIAttributesAsArray=function(e){for(var t=[],r=0;r<e.length;++r)for(var a=e[r],n=l.derToOid(a.value[0].value),i=a.value[1].value,s=0;s<i.length;++s){var o={};if(o.type=n,o.value=i[s].value,o.valueTagClass=i[s].type,o.type in h&&(o.name=h[o.type],o.name in f&&(o.shortName=f[o.name])),o.type===h.extensionRequest){o.extensions=[];for(var c=0;c<o.value.length;++c)o.extensions.push(p.certificateExtensionFromAsn1(o.value[c]))}t.push(o)}return t};var C=function(e,t,r){var a={};if(e!==h["RSASSA-PSS"])return a;r&&(a={hash:{algorithmOid:h.sha1},mgf:{algorithmOid:h.mgf1,hash:{algorithmOid:h.sha1}},saltLength:20});var n={},i=[];if(!l.validate(t,g,n,i)){var s=new Error("Cannot read RSASSA-PSS parameter block.");throw s.errors=i,s}return void 0!==n.hashOid&&(a.hash=a.hash||{},a.hash.algorithmOid=l.derToOid(n.hashOid)),void 0!==n.maskGenOid&&(a.mgf=a.mgf||{},a.mgf.algorithmOid=l.derToOid(n.maskGenOid),a.mgf.hash=a.mgf.hash||{},a.mgf.hash.algorithmOid=l.derToOid(n.maskGenHashOid)),void 0!==n.saltLength&&(a.saltLength=n.saltLength.charCodeAt(0)),a};p.certificateFromPem=function(e,t,r){var a=u.pem.decode(e)[0];if("CERTIFICATE"!==a.type&&"X509 CERTIFICATE"!==a.type&&"TRUSTED CERTIFICATE"!==a.type){var n=new Error('Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".');throw n.headerType=a.type,n}if(a.procType&&"ENCRYPTED"===a.procType.type)throw new Error("Could not convert certificate from PEM; PEM is encrypted.");var i=l.fromDer(a.body,r);return p.certificateFromAsn1(i,t)},p.certificateToPem=function(e,t){var r={type:"CERTIFICATE",body:l.toDer(p.certificateToAsn1(e)).getBytes()};return u.pem.encode(r,{maxline:t})},p.publicKeyFromPem=function(e){var t=u.pem.decode(e)[0];if("PUBLIC KEY"!==t.type&&"RSA PUBLIC KEY"!==t.type){var r=new Error('Could not convert public key from PEM; PEM header type is not "PUBLIC KEY" or "RSA PUBLIC KEY".');throw r.headerType=t.type,r}if(t.procType&&"ENCRYPTED"===t.procType.type)throw new Error("Could not convert public key from PEM; PEM is encrypted.");var a=l.fromDer(t.body);return p.publicKeyFromAsn1(a)},p.publicKeyToPem=function(e,t){var r={type:"PUBLIC KEY",body:l.toDer(p.publicKeyToAsn1(e)).getBytes()};return u.pem.encode(r,{maxline:t})},p.publicKeyToRSAPublicKeyPem=function(e,t){var r={type:"RSA PUBLIC KEY",body:l.toDer(p.publicKeyToRSAPublicKey(e)).getBytes()};return u.pem.encode(r,{maxline:t})},p.getPublicKeyFingerprint=function(e,t){t=t||{};var r,a=t.md||u.md.sha1.create(),n=t.type||"RSAPublicKey";switch(n){case"RSAPublicKey":r=l.toDer(p.publicKeyToRSAPublicKey(e)).getBytes();break;case"SubjectPublicKeyInfo":r=l.toDer(p.publicKeyToAsn1(e)).getBytes();break;default:throw new Error('Unknown fingerprint type "'+t.type+'".')}a.start(),a.update(r);var i=a.digest();if("hex"===t.encoding){var s=i.toHex();return t.delimiter?s.match(/.{2}/g).join(t.delimiter):s}if("binary"===t.encoding)return i.getBytes();if(t.encoding)throw new Error('Unknown encoding "'+t.encoding+'".');return i},p.certificationRequestFromPem=function(e,t,r){var a=u.pem.decode(e)[0];if("CERTIFICATE REQUEST"!==a.type){var n=new Error('Could not convert certification request from PEM; PEM header type is not "CERTIFICATE REQUEST".');throw n.headerType=a.type,n}if(a.procType&&"ENCRYPTED"===a.procType.type)throw new Error("Could not convert certification request from PEM; PEM is encrypted.");var i=l.fromDer(a.body,r);return p.certificationRequestFromAsn1(i,t)},p.certificationRequestToPem=function(e,t){var r={type:"CERTIFICATE REQUEST",body:l.toDer(p.certificationRequestToAsn1(e)).getBytes()};return u.pem.encode(r,{maxline:t})},p.createCertificate=function(){var e={};return e.version=2,e.serialNumber="00",e.signatureOid=null,e.signature=null,e.siginfo={},e.siginfo.algorithmOid=null,e.validity={},e.validity.notBefore=new Date,e.validity.notAfter=new Date,e.issuer={},e.issuer.getField=function(t){return a(e.issuer,t)},e.issuer.addField=function(t){i([t]),e.issuer.attributes.push(t)},e.issuer.attributes=[],e.issuer.hash=null,e.subject={},e.subject.getField=function(t){return a(e.subject,t)},e.subject.addField=function(t){i([t]),e.subject.attributes.push(t)},e.subject.attributes=[],e.subject.hash=null,e.extensions=[],e.publicKey=null,e.md=null,e.setSubject=function(t,r){i(t),e.subject.attributes=t,delete e.subject.uniqueId,r&&(e.subject.uniqueId=r),e.subject.hash=null},e.setIssuer=function(t,r){i(t),e.issuer.attributes=t,delete e.issuer.uniqueId,r&&(e.issuer.uniqueId=r),e.issuer.hash=null},e.setExtensions=function(t){for(var r=0;r<t.length;++r)s(t[r],{cert:e});e.extensions=t},e.getExtension=function(t){"string"==typeof t&&(t={name:t});for(var r,a=null,n=0;null===a&&n<e.extensions.length;++n)r=e.extensions[n],t.id&&r.id===t.id?a=r:t.name&&r.name===t.name&&(a=r);return a},e.sign=function(t,r){e.md=r||u.md.sha1.create();var a=h[e.md.algorithm+"WithRSAEncryption"];if(!a){var n=new Error("Could not compute certificate digest. Unknown message digest algorithm OID.");throw n.algorithm=e.md.algorithm,n}e.signatureOid=e.siginfo.algorithmOid=a,e.tbsCertificate=p.getTBSCertificate(e);var i=l.toDer(e.tbsCertificate);e.md.update(i.getBytes()),e.signature=t.sign(e.md)},e.verify=function(t){var r=!1;if(!e.issued(t)){var a=t.issuer,n=e.subject,i=new Error("The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject.");throw i.expectedIssuer=a.attributes,i.actualIssuer=n.attributes,i}var s=t.md;if(null===s){if(t.signatureOid in h){var o=h[t.signatureOid];switch(o){case"sha1WithRSAEncryption":s=u.md.sha1.create();break;case"md5WithRSAEncryption":s=u.md.md5.create();break;case"sha256WithRSAEncryption":s=u.md.sha256.create();break;case"sha512WithRSAEncryption":s=u.md.sha512.create();break;case"RSASSA-PSS":s=u.md.sha256.create()}}if(null===s){var i=new Error("Could not compute certificate digest. Unknown signature OID.");throw i.signatureOid=t.signatureOid,i}var c=t.tbsCertificate||p.getTBSCertificate(t),f=l.toDer(c);s.update(f.getBytes())}if(null!==s){var d;switch(t.signatureOid){case h.sha1WithRSAEncryption:d=void 0;break;case h["RSASSA-PSS"]:var y,g;if(y=h[t.signatureParameters.mgf.hash.algorithmOid],void 0===y||void 0===u.md[y]){var i=new Error("Unsupported MGF hash function.");throw i.oid=t.signatureParameters.mgf.hash.algorithmOid,i.name=y,i}if(g=h[t.signatureParameters.mgf.algorithmOid],void 0===g||void 0===u.mgf[g]){var i=new Error("Unsupported MGF function.");throw i.oid=t.signatureParameters.mgf.algorithmOid,i.name=g,i}if(g=u.mgf[g].create(u.md[y].create()),y=h[t.signatureParameters.hash.algorithmOid],void 0===y||void 0===u.md[y])throw{message:"Unsupported RSASSA-PSS hash function.",oid:t.signatureParameters.hash.algorithmOid,name:y};d=u.pss.create(u.md[y].create(),g,t.signatureParameters.saltLength)}r=e.publicKey.verify(s.digest().getBytes(),t.signature,d)}return r},e.isIssuer=function(t){var r=!1,a=e.issuer,n=t.subject;if(a.hash&&n.hash)r=a.hash===n.hash;else if(a.attributes.length===n.attributes.length){r=!0;for(var i,s,o=0;r&&o<a.attributes.length;++o)i=a.attributes[o],s=n.attributes[o],i.type===s.type&&i.value===s.value||(r=!1)}return r},e.issued=function(t){return t.isIssuer(e)},e.generateSubjectKeyIdentifier=function(){return p.getPublicKeyFingerprint(e.publicKey,{type:"RSAPublicKey"})},e.verifySubjectKeyIdentifier=function(){for(var t=h.subjectKeyIdentifier,r=0;r<e.extensions.length;++r){var a=e.extensions[r];if(a.id===t){var n=e.generateSubjectKeyIdentifier().getBytes();return u.util.hexToBytes(a.subjectKeyIdentifier)===n}}return!1},e},p.certificateFromAsn1=function(e,t){var r={},n=[];if(!l.validate(e,y,r,n)){var s=new Error("Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.");throw s.errors=n,s}var o=l.derToOid(r.publicKeyOid);if(o!==p.oids.rsaEncryption)throw new Error("Cannot read public key. OID is not RSA.");var c=p.createCertificate();c.version=r.certVersion?r.certVersion.charCodeAt(0):0;var f=u.util.createBuffer(r.certSerialNumber);c.serialNumber=f.toHex(),c.signatureOid=u.asn1.derToOid(r.certSignatureOid),c.signatureParameters=C(c.signatureOid,r.certSignatureParams,!0),c.siginfo.algorithmOid=u.asn1.derToOid(r.certinfoSignatureOid),c.siginfo.parameters=C(c.siginfo.algorithmOid,r.certinfoSignatureParams,!1),c.signature=r.certSignature;var d=[];if(void 0!==r.certValidity1UTCTime&&d.push(l.utcTimeToDate(r.certValidity1UTCTime)),void 0!==r.certValidity2GeneralizedTime&&d.push(l.generalizedTimeToDate(r.certValidity2GeneralizedTime)),void 0!==r.certValidity3UTCTime&&d.push(l.utcTimeToDate(r.certValidity3UTCTime)),void 0!==r.certValidity4GeneralizedTime&&d.push(l.generalizedTimeToDate(r.certValidity4GeneralizedTime)),d.length>2)throw new Error("Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate.");if(d.length<2)throw new Error("Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime.");if(c.validity.notBefore=d[0],c.validity.notAfter=d[1],c.tbsCertificate=r.tbsCertificate,t){if(c.md=null,c.signatureOid in h){var o=h[c.signatureOid];switch(o){case"sha1WithRSAEncryption":c.md=u.md.sha1.create();break;case"md5WithRSAEncryption":c.md=u.md.md5.create();break;case"sha256WithRSAEncryption":c.md=u.md.sha256.create();break;case"sha512WithRSAEncryption":c.md=u.md.sha512.create();break;case"RSASSA-PSS":c.md=u.md.sha256.create()}}if(null===c.md){var s=new Error("Could not compute certificate digest. Unknown signature OID.");
throw s.signatureOid=c.signatureOid,s}var g=l.toDer(c.tbsCertificate);c.md.update(g.getBytes())}var v=u.md.sha1.create();c.issuer.getField=function(e){return a(c.issuer,e)},c.issuer.addField=function(e){i([e]),c.issuer.attributes.push(e)},c.issuer.attributes=p.RDNAttributesAsArray(r.certIssuer,v),r.certIssuerUniqueId&&(c.issuer.uniqueId=r.certIssuerUniqueId),c.issuer.hash=v.digest().toHex();var m=u.md.sha1.create();return c.subject.getField=function(e){return a(c.subject,e)},c.subject.addField=function(e){i([e]),c.subject.attributes.push(e)},c.subject.attributes=p.RDNAttributesAsArray(r.certSubject,m),r.certSubjectUniqueId&&(c.subject.uniqueId=r.certSubjectUniqueId),c.subject.hash=m.digest().toHex(),r.certExtensions?c.extensions=p.certificateExtensionsFromAsn1(r.certExtensions):c.extensions=[],c.publicKey=p.publicKeyFromAsn1(r.subjectPublicKeyInfo),c},p.certificateExtensionsFromAsn1=function(e){for(var t=[],r=0;r<e.value.length;++r)for(var a=e.value[r],n=0;n<a.value.length;++n)t.push(p.certificateExtensionFromAsn1(a.value[n]));return t},p.certificateExtensionFromAsn1=function(e){var t={};if(t.id=l.derToOid(e.value[0].value),t.critical=!1,e.value[1].type===l.Type.BOOLEAN?(t.critical=0!==e.value[1].value.charCodeAt(0),t.value=e.value[2].value):t.value=e.value[1].value,t.id in h)if(t.name=h[t.id],"keyUsage"===t.name){var r=l.fromDer(t.value),a=0,n=0;r.value.length>1&&(a=r.value.charCodeAt(1),n=r.value.length>2?r.value.charCodeAt(2):0),t.digitalSignature=128===(128&a),t.nonRepudiation=64===(64&a),t.keyEncipherment=32===(32&a),t.dataEncipherment=16===(16&a),t.keyAgreement=8===(8&a),t.keyCertSign=4===(4&a),t.cRLSign=2===(2&a),t.encipherOnly=1===(1&a),t.decipherOnly=128===(128&n)}else if("basicConstraints"===t.name){var r=l.fromDer(t.value);r.value.length>0&&r.value[0].type===l.Type.BOOLEAN?t.cA=0!==r.value[0].value.charCodeAt(0):t.cA=!1;var i=null;r.value.length>0&&r.value[0].type===l.Type.INTEGER?i=r.value[0].value:r.value.length>1&&(i=r.value[1].value),null!==i&&(t.pathLenConstraint=l.derToInteger(i))}else if("extKeyUsage"===t.name)for(var r=l.fromDer(t.value),s=0;s<r.value.length;++s){var o=l.derToOid(r.value[s].value);o in h?t[h[o]]=!0:t[o]=!0}else if("nsCertType"===t.name){var r=l.fromDer(t.value),a=0;r.value.length>1&&(a=r.value.charCodeAt(1)),t.client=128===(128&a),t.server=64===(64&a),t.email=32===(32&a),t.objsign=16===(16&a),t.reserved=8===(8&a),t.sslCA=4===(4&a),t.emailCA=2===(2&a),t.objCA=1===(1&a)}else if("subjectAltName"===t.name||"issuerAltName"===t.name){t.altNames=[];for(var c,r=l.fromDer(t.value),p=0;p<r.value.length;++p){c=r.value[p];var f={type:c.type,value:c.value};switch(t.altNames.push(f),c.type){case 1:case 2:case 6:break;case 7:f.ip=u.util.bytesToIP(c.value);break;case 8:f.oid=l.derToOid(c.value)}}}else if("subjectKeyIdentifier"===t.name){var r=l.fromDer(t.value);t.subjectKeyIdentifier=u.util.bytesToHex(r.value)}return t},p.certificationRequestFromAsn1=function(e,t){var r={},n=[];if(!l.validate(e,m,r,n)){var s=new Error("Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.");throw s.errors=n,s}var o=l.derToOid(r.publicKeyOid);if(o!==p.oids.rsaEncryption)throw new Error("Cannot read public key. OID is not RSA.");var c=p.createCertificationRequest();if(c.version=r.csrVersion?r.csrVersion.charCodeAt(0):0,c.signatureOid=u.asn1.derToOid(r.csrSignatureOid),c.signatureParameters=C(c.signatureOid,r.csrSignatureParams,!0),c.siginfo.algorithmOid=u.asn1.derToOid(r.csrSignatureOid),c.siginfo.parameters=C(c.siginfo.algorithmOid,r.csrSignatureParams,!1),c.signature=r.csrSignature,c.certificationRequestInfo=r.certificationRequestInfo,t){if(c.md=null,c.signatureOid in h){var o=h[c.signatureOid];switch(o){case"sha1WithRSAEncryption":c.md=u.md.sha1.create();break;case"md5WithRSAEncryption":c.md=u.md.md5.create();break;case"sha256WithRSAEncryption":c.md=u.md.sha256.create();break;case"sha512WithRSAEncryption":c.md=u.md.sha512.create();break;case"RSASSA-PSS":c.md=u.md.sha256.create()}}if(null===c.md){var s=new Error("Could not compute certification request digest. Unknown signature OID.");throw s.signatureOid=c.signatureOid,s}var f=l.toDer(c.certificationRequestInfo);c.md.update(f.getBytes())}var d=u.md.sha1.create();return c.subject.getField=function(e){return a(c.subject,e)},c.subject.addField=function(e){i([e]),c.subject.attributes.push(e)},c.subject.attributes=p.RDNAttributesAsArray(r.certificationRequestInfoSubject,d),c.subject.hash=d.digest().toHex(),c.publicKey=p.publicKeyFromAsn1(r.subjectPublicKeyInfo),c.getAttribute=function(e){return a(c,e)},c.addAttribute=function(e){i([e]),c.attributes.push(e)},c.attributes=p.CRIAttributesAsArray(r.certificationRequestInfoAttributes||[]),c},p.createCertificationRequest=function(){var e={};return e.version=0,e.signatureOid=null,e.signature=null,e.siginfo={},e.siginfo.algorithmOid=null,e.subject={},e.subject.getField=function(t){return a(e.subject,t)},e.subject.addField=function(t){i([t]),e.subject.attributes.push(t)},e.subject.attributes=[],e.subject.hash=null,e.publicKey=null,e.attributes=[],e.getAttribute=function(t){return a(e,t)},e.addAttribute=function(t){i([t]),e.attributes.push(t)},e.md=null,e.setSubject=function(t){i(t),e.subject.attributes=t,e.subject.hash=null},e.setAttributes=function(t){i(t),e.attributes=t},e.sign=function(t,r){e.md=r||u.md.sha1.create();var a=h[e.md.algorithm+"WithRSAEncryption"];if(!a){var n=new Error("Could not compute certification request digest. Unknown message digest algorithm OID.");throw n.algorithm=e.md.algorithm,n}e.signatureOid=e.siginfo.algorithmOid=a,e.certificationRequestInfo=p.getCertificationRequestInfo(e);var i=l.toDer(e.certificationRequestInfo);e.md.update(i.getBytes()),e.signature=t.sign(e.md)},e.verify=function(){var t=!1,r=e.md;if(null===r){if(e.signatureOid in h){var a=h[e.signatureOid];switch(a){case"sha1WithRSAEncryption":r=u.md.sha1.create();break;case"md5WithRSAEncryption":r=u.md.md5.create();break;case"sha256WithRSAEncryption":r=u.md.sha256.create();break;case"sha512WithRSAEncryption":r=u.md.sha512.create();break;case"RSASSA-PSS":r=u.md.sha256.create()}}if(null===r){var n=new Error("Could not compute certification request digest. Unknown signature OID.");throw n.signatureOid=e.signatureOid,n}var i=e.certificationRequestInfo||p.getCertificationRequestInfo(e),s=l.toDer(i);r.update(s.getBytes())}if(null!==r){var o;switch(e.signatureOid){case h.sha1WithRSAEncryption:break;case h["RSASSA-PSS"]:var c,f;if(c=h[e.signatureParameters.mgf.hash.algorithmOid],void 0===c||void 0===u.md[c]){var n=new Error("Unsupported MGF hash function.");throw n.oid=e.signatureParameters.mgf.hash.algorithmOid,n.name=c,n}if(f=h[e.signatureParameters.mgf.algorithmOid],void 0===f||void 0===u.mgf[f]){var n=new Error("Unsupported MGF function.");throw n.oid=e.signatureParameters.mgf.algorithmOid,n.name=f,n}if(f=u.mgf[f].create(u.md[c].create()),c=h[e.signatureParameters.hash.algorithmOid],void 0===c||void 0===u.md[c]){var n=new Error("Unsupported RSASSA-PSS hash function.");throw n.oid=e.signatureParameters.hash.algorithmOid,n.name=c,n}o=u.pss.create(u.md[c].create(),f,e.signatureParameters.saltLength)}t=e.publicKey.verify(r.digest().getBytes(),e.signature,o)}return t},e},p.getTBSCertificate=function(e){var t=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(e.version).getBytes())]),l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,u.util.hexToBytes(e.serialNumber)),l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(e.siginfo.algorithmOid).getBytes()),o(e.siginfo.algorithmOid,e.siginfo.parameters)]),n(e.issuer),l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.UTCTIME,!1,l.dateToUtcTime(e.validity.notBefore)),l.create(l.Class.UNIVERSAL,l.Type.UTCTIME,!1,l.dateToUtcTime(e.validity.notAfter))]),n(e.subject),p.publicKeyToAsn1(e.publicKey)]);return e.issuer.uniqueId&&t.value.push(l.create(l.Class.CONTEXT_SPECIFIC,1,!0,[l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,String.fromCharCode(0)+e.issuer.uniqueId)])),e.subject.uniqueId&&t.value.push(l.create(l.Class.CONTEXT_SPECIFIC,2,!0,[l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,String.fromCharCode(0)+e.subject.uniqueId)])),e.extensions.length>0&&t.value.push(p.certificateExtensionsToAsn1(e.extensions)),t},p.getCertificationRequestInfo=function(e){var t=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(e.version).getBytes()),n(e.subject),p.publicKeyToAsn1(e.publicKey),c(e)]);return t},p.distinguishedNameToAsn1=function(e){return n(e)},p.certificateToAsn1=function(e){var t=e.tbsCertificate||p.getTBSCertificate(e);return l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[t,l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(e.signatureOid).getBytes()),o(e.signatureOid,e.signatureParameters)]),l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,String.fromCharCode(0)+e.signature)])},p.certificateExtensionsToAsn1=function(e){var t=l.create(l.Class.CONTEXT_SPECIFIC,3,!0,[]),r=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);t.value.push(r);for(var a=0;a<e.length;++a)r.value.push(p.certificateExtensionToAsn1(e[a]));return t},p.certificateExtensionToAsn1=function(e){var t=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[]);t.value.push(l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(e.id).getBytes())),e.critical&&t.value.push(l.create(l.Class.UNIVERSAL,l.Type.BOOLEAN,!1,String.fromCharCode(255)));var r=e.value;return"string"!=typeof e.value&&(r=l.toDer(r).getBytes()),t.value.push(l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,r)),t},p.certificationRequestToAsn1=function(e){var t=e.certificationRequestInfo||p.getCertificationRequestInfo(e);return l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[t,l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(e.signatureOid).getBytes()),o(e.signatureOid,e.signatureParameters)]),l.create(l.Class.UNIVERSAL,l.Type.BITSTRING,!1,String.fromCharCode(0)+e.signature)])},p.createCaStore=function(e){function t(e){return r(e),a.certs[e.hash]||null}function r(e){if(!e.hash){var t=u.md.sha1.create();e.attributes=p.RDNAttributesAsArray(n(e),t),e.hash=t.digest().toHex()}}var a={certs:{}};if(a.getIssuer=function(e){var r=t(e.issuer);return r},a.addCertificate=function(e){if("string"==typeof e&&(e=u.pki.certificateFromPem(e)),r(e.subject),!a.hasCertificate(e))if(e.subject.hash in a.certs){var t=a.certs[e.subject.hash];u.util.isArray(t)||(t=[t]),t.push(e),a.certs[e.subject.hash]=t}else a.certs[e.subject.hash]=e},a.hasCertificate=function(e){"string"==typeof e&&(e=u.pki.certificateFromPem(e));var r=t(e.subject);if(!r)return!1;u.util.isArray(r)||(r=[r]);for(var a=l.toDer(p.certificateToAsn1(e)).getBytes(),n=0;n<r.length;++n){var i=l.toDer(p.certificateToAsn1(r[n])).getBytes();if(a===i)return!0}return!1},a.listAllCertificates=function(){var e=[];for(var t in a.certs)if(a.certs.hasOwnProperty(t)){var r=a.certs[t];if(u.util.isArray(r))for(var n=0;n<r.length;++n)e.push(r[n]);else e.push(r)}return e},a.removeCertificate=function(e){var n;if("string"==typeof e&&(e=u.pki.certificateFromPem(e)),r(e.subject),!a.hasCertificate(e))return null;var i=t(e.subject);if(!u.util.isArray(i))return n=a.certs[e.subject.hash],delete a.certs[e.subject.hash],n;for(var s=l.toDer(p.certificateToAsn1(e)).getBytes(),o=0;o<i.length;++o){var c=l.toDer(p.certificateToAsn1(i[o])).getBytes();s===c&&(n=i[o],i.splice(o,1))}return 0===i.length&&delete a.certs[e.subject.hash],n},e)for(var i=0;i<e.length;++i){var s=e[i];a.addCertificate(s)}return a},p.certificateError={bad_certificate:"forge.pki.BadCertificate",unsupported_certificate:"forge.pki.UnsupportedCertificate",certificate_revoked:"forge.pki.CertificateRevoked",certificate_expired:"forge.pki.CertificateExpired",certificate_unknown:"forge.pki.CertificateUnknown",unknown_ca:"forge.pki.UnknownCertificateAuthority"},p.verifyCertificateChain=function(e,t,r){t=t.slice(0);var a=t.slice(0),n=new Date,i=!0,s=null,o=0;do{var c=t.shift(),l=null,h=!1;if((n<c.validity.notBefore||n>c.validity.notAfter)&&(s={message:"Certificate is not valid yet or has expired.",error:p.certificateError.certificate_expired,notBefore:c.validity.notBefore,notAfter:c.validity.notAfter,now:n}),null===s){if(l=t[0]||e.getIssuer(c),null===l&&c.isIssuer(c)&&(h=!0,l=c),l){var f=l;u.util.isArray(f)||(f=[f]);for(var d=!1;!d&&f.length>0;){l=f.shift();try{d=l.verify(c)}catch(e){}}d||(s={message:"Certificate signature is invalid.",error:p.certificateError.bad_certificate})}null!==s||l&&!h||e.hasCertificate(c)||(s={message:"Certificate is not trusted.",error:p.certificateError.unknown_ca})}if(null===s&&l&&!c.isIssuer(l)&&(s={message:"Certificate issuer is invalid.",error:p.certificateError.bad_certificate}),null===s)for(var y={keyUsage:!0,basicConstraints:!0},g=0;null===s&&g<c.extensions.length;++g){var v=c.extensions[g];!v.critical||v.name in y||(s={message:"Certificate has an unsupported critical extension.",error:p.certificateError.unsupported_certificate})}if(null===s&&(!i||0===t.length&&(!l||h))){var m=c.getExtension("basicConstraints"),C=c.getExtension("keyUsage");if(null!==C&&(C.keyCertSign&&null!==m||(s={message:"Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",error:p.certificateError.bad_certificate})),null!==s||null===m||m.cA||(s={message:"Certificate basicConstraints indicates the certificate is not a CA.",error:p.certificateError.bad_certificate}),null===s&&null!==C&&"pathLenConstraint"in m){var E=o-1;E>m.pathLenConstraint&&(s={message:"Certificate basicConstraints pathLenConstraint violated.",error:p.certificateError.bad_certificate})}}var S=null===s||s.error,T=r?r(S,o,a):S;if(T!==!0)throw S===!0&&(s={message:"The application rejected the certificate.",error:p.certificateError.bad_certificate}),(T||0===T)&&("object"!=typeof T||u.util.isArray(T)?"string"==typeof T&&(s.error=T):(T.message&&(s.message=T.message),T.error&&(s.error=T.error))),s;s=null,i=!1,++o}while(t.length>0);return!0}},function(e,t,r){function a(e){if("string"==typeof e&&(e=s.util.createBuffer(e)),s.util.isArray(e)&&e.length>4){var t=e;e=s.util.createBuffer();for(var r=0;r<t.length;++r)e.putByte(t[r])}return s.util.isArray(e)||(e=[e.getInt32(),e.getInt32(),e.getInt32(),e.getInt32()]),e}function n(e){e[e.length-1]=e[e.length-1]+1&4294967295}function i(e){return[e/4294967296|0,4294967295&e]}var s=r(0);r(1),s.cipher=s.cipher||{};var o=e.exports=s.cipher.modes=s.cipher.modes||{};o.ecb=function(e){e=e||{},this.name="ECB",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=new Array(this._ints),this._outBlock=new Array(this._ints)},o.ecb.prototype.start=function(e){},o.ecb.prototype.encrypt=function(e,t,r){if(e.length()<this.blockSize&&!(r&&e.length()>0))return!0;for(var a=0;a<this._ints;++a)this._inBlock[a]=e.getInt32();this.cipher.encrypt(this._inBlock,this._outBlock);for(var a=0;a<this._ints;++a)t.putInt32(this._outBlock[a])},o.ecb.prototype.decrypt=function(e,t,r){if(e.length()<this.blockSize&&!(r&&e.length()>0))return!0;for(var a=0;a<this._ints;++a)this._inBlock[a]=e.getInt32();this.cipher.decrypt(this._inBlock,this._outBlock);for(var a=0;a<this._ints;++a)t.putInt32(this._outBlock[a])},o.ecb.prototype.pad=function(e,t){var r=e.length()===this.blockSize?this.blockSize:this.blockSize-e.length();return e.fillWithByte(r,r),!0},o.ecb.prototype.unpad=function(e,t){if(t.overflow>0)return!1;var r=e.length(),a=e.at(r-1);return!(a>this.blockSize<<2)&&(e.truncate(a),!0)},o.cbc=function(e){e=e||{},this.name="CBC",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=new Array(this._ints),this._outBlock=new Array(this._ints)},o.cbc.prototype.start=function(e){if(null===e.iv){if(!this._prev)throw new Error("Invalid IV parameter.");this._iv=this._prev.slice(0)}else{if(!("iv"in e))throw new Error("Invalid IV parameter.");this._iv=a(e.iv),this._prev=this._iv.slice(0)}},o.cbc.prototype.encrypt=function(e,t,r){if(e.length()<this.blockSize&&!(r&&e.length()>0))return!0;for(var a=0;a<this._ints;++a)this._inBlock[a]=this._prev[a]^e.getInt32();this.cipher.encrypt(this._inBlock,this._outBlock);for(var a=0;a<this._ints;++a)t.putInt32(this._outBlock[a]);this._prev=this._outBlock},o.cbc.prototype.decrypt=function(e,t,r){if(e.length()<this.blockSize&&!(r&&e.length()>0))return!0;for(var a=0;a<this._ints;++a)this._inBlock[a]=e.getInt32();this.cipher.decrypt(this._inBlock,this._outBlock);for(var a=0;a<this._ints;++a)t.putInt32(this._prev[a]^this._outBlock[a]);this._prev=this._inBlock.slice(0)},o.cbc.prototype.pad=function(e,t){var r=e.length()===this.blockSize?this.blockSize:this.blockSize-e.length();return e.fillWithByte(r,r),!0},o.cbc.prototype.unpad=function(e,t){if(t.overflow>0)return!1;var r=e.length(),a=e.at(r-1);return!(a>this.blockSize<<2)&&(e.truncate(a),!0)},o.cfb=function(e){e=e||{},this.name="CFB",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=null,this._outBlock=new Array(this._ints),this._partialBlock=new Array(this._ints),this._partialOutput=s.util.createBuffer(),this._partialBytes=0},o.cfb.prototype.start=function(e){if(!("iv"in e))throw new Error("Invalid IV parameter.");this._iv=a(e.iv),this._inBlock=this._iv.slice(0),this._partialBytes=0},o.cfb.prototype.encrypt=function(e,t,r){var a=e.length();if(0===a)return!0;if(this.cipher.encrypt(this._inBlock,this._outBlock),0===this._partialBytes&&a>=this.blockSize)for(var n=0;n<this._ints;++n)this._inBlock[n]=e.getInt32()^this._outBlock[n],t.putInt32(this._inBlock[n]);else{var i=(this.blockSize-a)%this.blockSize;i>0&&(i=this.blockSize-i),this._partialOutput.clear();for(var n=0;n<this._ints;++n)this._partialBlock[n]=e.getInt32()^this._outBlock[n],this._partialOutput.putInt32(this._partialBlock[n]);if(i>0)e.read-=this.blockSize;else for(var n=0;n<this._ints;++n)this._inBlock[n]=this._partialBlock[n];if(this._partialBytes>0&&this._partialOutput.getBytes(this._partialBytes),i>0&&!r)return t.putBytes(this._partialOutput.getBytes(i-this._partialBytes)),this._partialBytes=i,!0;t.putBytes(this._partialOutput.getBytes(a-this._partialBytes)),this._partialBytes=0}},o.cfb.prototype.decrypt=function(e,t,r){var a=e.length();if(0===a)return!0;if(this.cipher.encrypt(this._inBlock,this._outBlock),0===this._partialBytes&&a>=this.blockSize)for(var n=0;n<this._ints;++n)this._inBlock[n]=e.getInt32(),t.putInt32(this._inBlock[n]^this._outBlock[n]);else{var i=(this.blockSize-a)%this.blockSize;i>0&&(i=this.blockSize-i),this._partialOutput.clear();for(var n=0;n<this._ints;++n)this._partialBlock[n]=e.getInt32(),this._partialOutput.putInt32(this._partialBlock[n]^this._outBlock[n]);if(i>0)e.read-=this.blockSize;else for(var n=0;n<this._ints;++n)this._inBlock[n]=this._partialBlock[n];if(this._partialBytes>0&&this._partialOutput.getBytes(this._partialBytes),i>0&&!r)return t.putBytes(this._partialOutput.getBytes(i-this._partialBytes)),this._partialBytes=i,!0;t.putBytes(this._partialOutput.getBytes(a-this._partialBytes)),this._partialBytes=0}},o.ofb=function(e){e=e||{},this.name="OFB",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=null,this._outBlock=new Array(this._ints),this._partialOutput=s.util.createBuffer(),this._partialBytes=0},o.ofb.prototype.start=function(e){if(!("iv"in e))throw new Error("Invalid IV parameter.");this._iv=a(e.iv),this._inBlock=this._iv.slice(0),this._partialBytes=0},o.ofb.prototype.encrypt=function(e,t,r){var a=e.length();if(0===e.length())return!0;if(this.cipher.encrypt(this._inBlock,this._outBlock),0===this._partialBytes&&a>=this.blockSize)for(var n=0;n<this._ints;++n)t.putInt32(e.getInt32()^this._outBlock[n]),this._inBlock[n]=this._outBlock[n];else{var i=(this.blockSize-a)%this.blockSize;i>0&&(i=this.blockSize-i),this._partialOutput.clear();for(var n=0;n<this._ints;++n)this._partialOutput.putInt32(e.getInt32()^this._outBlock[n]);if(i>0)e.read-=this.blockSize;else for(var n=0;n<this._ints;++n)this._inBlock[n]=this._outBlock[n];if(this._partialBytes>0&&this._partialOutput.getBytes(this._partialBytes),i>0&&!r)return t.putBytes(this._partialOutput.getBytes(i-this._partialBytes)),this._partialBytes=i,!0;t.putBytes(this._partialOutput.getBytes(a-this._partialBytes)),this._partialBytes=0}},o.ofb.prototype.decrypt=o.ofb.prototype.encrypt,o.ctr=function(e){e=e||{},this.name="CTR",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=null,this._outBlock=new Array(this._ints),this._partialOutput=s.util.createBuffer(),this._partialBytes=0},o.ctr.prototype.start=function(e){if(!("iv"in e))throw new Error("Invalid IV parameter.");this._iv=a(e.iv),this._inBlock=this._iv.slice(0),this._partialBytes=0},o.ctr.prototype.encrypt=function(e,t,r){var a=e.length();if(0===a)return!0;if(this.cipher.encrypt(this._inBlock,this._outBlock),0===this._partialBytes&&a>=this.blockSize)for(var i=0;i<this._ints;++i)t.putInt32(e.getInt32()^this._outBlock[i]);else{var s=(this.blockSize-a)%this.blockSize;s>0&&(s=this.blockSize-s),this._partialOutput.clear();for(var i=0;i<this._ints;++i)this._partialOutput.putInt32(e.getInt32()^this._outBlock[i]);if(s>0&&(e.read-=this.blockSize),this._partialBytes>0&&this._partialOutput.getBytes(this._partialBytes),s>0&&!r)return t.putBytes(this._partialOutput.getBytes(s-this._partialBytes)),this._partialBytes=s,!0;t.putBytes(this._partialOutput.getBytes(a-this._partialBytes)),this._partialBytes=0}n(this._inBlock)},o.ctr.prototype.decrypt=o.ctr.prototype.encrypt,o.gcm=function(e){e=e||{},this.name="GCM",this.cipher=e.cipher,this.blockSize=e.blockSize||16,this._ints=this.blockSize/4,this._inBlock=new Array(this._ints),this._outBlock=new Array(this._ints),this._partialOutput=s.util.createBuffer(),this._partialBytes=0,this._R=3774873600},o.gcm.prototype.start=function(e){if(!("iv"in e))throw new Error("Invalid IV parameter.");var t=s.util.createBuffer(e.iv);this._cipherLength=0;var r;if(r="additionalData"in e?s.util.createBuffer(e.additionalData):s.util.createBuffer(),"tagLength"in e?this._tagLength=e.tagLength:this._tagLength=128,this._tag=null,e.decrypt&&(this._tag=s.util.createBuffer(e.tag).getBytes(),this._tag.length!==this._tagLength/8))throw new Error("Authentication tag does not match tag length.");this._hashBlock=new Array(this._ints),this.tag=null,this._hashSubkey=new Array(this._ints),this.cipher.encrypt([0,0,0,0],this._hashSubkey),this.componentBits=4,this._m=this.generateHashTable(this._hashSubkey,this.componentBits);var a=t.length();if(12===a)this._j0=[t.getInt32(),t.getInt32(),t.getInt32(),1];else{for(this._j0=[0,0,0,0];t.length()>0;)this._j0=this.ghash(this._hashSubkey,this._j0,[t.getInt32(),t.getInt32(),t.getInt32(),t.getInt32()]);this._j0=this.ghash(this._hashSubkey,this._j0,[0,0].concat(i(8*a)))}this._inBlock=this._j0.slice(0),n(this._inBlock),this._partialBytes=0,r=s.util.createBuffer(r),this._aDataLength=i(8*r.length());var o=r.length()%this.blockSize;for(o&&r.fillWithByte(0,this.blockSize-o),this._s=[0,0,0,0];r.length()>0;)this._s=this.ghash(this._hashSubkey,this._s,[r.getInt32(),r.getInt32(),r.getInt32(),r.getInt32()])},o.gcm.prototype.encrypt=function(e,t,r){var a=e.length();if(0===a)return!0;if(this.cipher.encrypt(this._inBlock,this._outBlock),0===this._partialBytes&&a>=this.blockSize){for(var i=0;i<this._ints;++i)t.putInt32(this._outBlock[i]^=e.getInt32());this._cipherLength+=this.blockSize}else{var s=(this.blockSize-a)%this.blockSize;s>0&&(s=this.blockSize-s),this._partialOutput.clear();for(var i=0;i<this._ints;++i)this._partialOutput.putInt32(e.getInt32()^this._outBlock[i]);if(0===s||r){if(r){var o=a%this.blockSize;this._cipherLength+=o,this._partialOutput.truncate(this.blockSize-o)}else this._cipherLength+=this.blockSize;for(var i=0;i<this._ints;++i)this._outBlock[i]=this._partialOutput.getInt32();this._partialOutput.read-=this.blockSize}if(this._partialBytes>0&&this._partialOutput.getBytes(this._partialBytes),s>0&&!r)return e.read-=this.blockSize,t.putBytes(this._partialOutput.getBytes(s-this._partialBytes)),this._partialBytes=s,!0;t.putBytes(this._partialOutput.getBytes(a-this._partialBytes)),this._partialBytes=0}this._s=this.ghash(this._hashSubkey,this._s,this._outBlock),n(this._inBlock)},o.gcm.prototype.decrypt=function(e,t,r){var a=e.length();if(a<this.blockSize&&!(r&&a>0))return!0;this.cipher.encrypt(this._inBlock,this._outBlock),n(this._inBlock),this._hashBlock[0]=e.getInt32(),this._hashBlock[1]=e.getInt32(),this._hashBlock[2]=e.getInt32(),this._hashBlock[3]=e.getInt32(),this._s=this.ghash(this._hashSubkey,this._s,this._hashBlock);for(var i=0;i<this._ints;++i)t.putInt32(this._outBlock[i]^this._hashBlock[i]);a<this.blockSize?this._cipherLength+=a%this.blockSize:this._cipherLength+=this.blockSize},o.gcm.prototype.afterFinish=function(e,t){var r=!0;t.decrypt&&t.overflow&&e.truncate(this.blockSize-t.overflow),this.tag=s.util.createBuffer();var a=this._aDataLength.concat(i(8*this._cipherLength));this._s=this.ghash(this._hashSubkey,this._s,a);var n=[];this.cipher.encrypt(this._j0,n);for(var o=0;o<this._ints;++o)this.tag.putInt32(this._s[o]^n[o]);return this.tag.truncate(this.tag.length()%(this._tagLength/8)),t.decrypt&&this.tag.bytes()!==this._tag&&(r=!1),r},o.gcm.prototype.multiply=function(e,t){for(var r=[0,0,0,0],a=t.slice(0),n=0;n<128;++n){var i=e[n/32|0]&1<<31-n%32;i&&(r[0]^=a[0],r[1]^=a[1],r[2]^=a[2],r[3]^=a[3]),this.pow(a,a)}return r},o.gcm.prototype.pow=function(e,t){for(var r=1&e[3],a=3;a>0;--a)t[a]=e[a]>>>1|(1&e[a-1])<<31;t[0]=e[0]>>>1,r&&(t[0]^=this._R)},o.gcm.prototype.tableMultiply=function(e){for(var t=[0,0,0,0],r=0;r<32;++r){var a=r/8|0,n=e[a]>>>4*(7-r%8)&15,i=this._m[r][n];t[0]^=i[0],t[1]^=i[1],t[2]^=i[2],t[3]^=i[3]}return t},o.gcm.prototype.ghash=function(e,t,r){return t[0]^=r[0],t[1]^=r[1],t[2]^=r[2],t[3]^=r[3],this.tableMultiply(t)},o.gcm.prototype.generateHashTable=function(e,t){for(var r=8/t,a=4*r,n=16*r,i=new Array(n),s=0;s<n;++s){var o=[0,0,0,0],c=s/a|0,u=(a-1-s%a)*t;o[c]=1<<t-1<<u,i[s]=this.generateSubHashTable(this.multiply(o,e),t)}return i},o.gcm.prototype.generateSubHashTable=function(e,t){var r=1<<t,a=r>>>1,n=new Array(r);n[a]=e.slice(0);for(var i=a>>>1;i>0;)this.pow(n[2*i],n[i]=[]),i>>=1;for(i=2;i<a;){for(var s=1;s<i;++s){var o=n[i],c=n[s];n[i+s]=[o[0]^c[0],o[1]^c[1],o[2]^c[2],o[3]^c[3]]}i*=2}for(n[0]=[0,0,0,0],i=a+1;i<r;++i){var u=n[i^a];n[i]=[e[0]^u[0],e[1]^u[1],e[2]^u[2],e[3]^u[3]]}return n}},function(e,t,r){var a=r(0);e.exports=a.debug=a.debug||{},a.debug.storage={},a.debug.get=function(e,t){var r;return"undefined"==typeof e?r=a.debug.storage:e in a.debug.storage&&(r="undefined"==typeof t?a.debug.storage[e]:a.debug.storage[e][t]),r},a.debug.set=function(e,t,r){e in a.debug.storage||(a.debug.storage[e]={}),a.debug.storage[e][t]=r},a.debug.clear=function(e,t){"undefined"==typeof e?a.debug.storage={}:e in a.debug.storage&&("undefined"==typeof t?delete a.debug.storage[e]:delete a.debug.storage[e][t])}},function(e,t,r){var a=r(0);r(1),e.exports=a.log=a.log||{},a.log.levels=["none","error","warning","info","debug","verbose","max"];var n={},i=[],s=null;a.log.LEVEL_LOCKED=2,a.log.NO_LEVEL_CHECK=4,a.log.INTERPOLATE=8;for(var o=0;o<a.log.levels.length;++o){var c=a.log.levels[o];n[c]={index:o,name:c.toUpperCase()}}a.log.logMessage=function(e){for(var t=n[e.level].index,r=0;r<i.length;++r){var s=i[r];if(s.flags&a.log.NO_LEVEL_CHECK)s.f(e);else{var o=n[s.level].index;t<=o&&s.f(s,e)}}},a.log.prepareStandard=function(e){"standard"in e||(e.standard=n[e.level].name+" ["+e.category+"] "+e.message)},a.log.prepareFull=function(e){if(!("full"in e)){var t=[e.message];t=t.concat([]||e.arguments),e.full=a.util.format.apply(this,t)}},a.log.prepareStandardFull=function(e){"standardFull"in e||(a.log.prepareStandard(e),e.standardFull=e.standard)};for(var u=["error","warning","info","debug","verbose"],o=0;o<u.length;++o)!function(e){a.log[e]=function(t,r){var n=Array.prototype.slice.call(arguments).slice(2),i={timestamp:new Date,level:e,category:t,message:r,arguments:n};a.log.logMessage(i)}}(u[o]);if(a.log.makeLogger=function(e){var t={flags:0,f:e};return a.log.setLevel(t,"none"),t},a.log.setLevel=function(e,t){var r=!1;if(e&&!(e.flags&a.log.LEVEL_LOCKED))for(var n=0;n<a.log.levels.length;++n){var i=a.log.levels[n];if(t==i){e.level=t,r=!0;break}}return r},a.log.lock=function(e,t){"undefined"==typeof t||t?e.flags|=a.log.LEVEL_LOCKED:e.flags&=~a.log.LEVEL_LOCKED},a.log.addLogger=function(e){i.push(e)},"undefined"!=typeof console&&"log"in console){var l;if(console.error&&console.warn&&console.info&&console.debug){var p={error:console.error,warning:console.warn,info:console.info,debug:console.debug,verbose:console.debug},h=function(e,t){a.log.prepareStandard(t);var r=p[t.level],n=[t.standard];n=n.concat(t.arguments.slice()),r.apply(console,n)};l=a.log.makeLogger(h)}else{var h=function(e,t){a.log.prepareStandardFull(t),console.log(t.standardFull)};l=a.log.makeLogger(h)}a.log.setLevel(l,"debug"),a.log.addLogger(l),s=l}else console={log:function(){}};if(null!==s){var f=a.util.getQueryVariables();if("console.level"in f&&a.log.setLevel(s,f["console.level"].slice(-1)[0]),"console.lock"in f){var d=f["console.lock"].slice(-1)[0];"true"==d&&a.log.lock(s)}}a.log.consoleLogger=s},function(e,t,r){var a=r(0);r(1),a.mgf=a.mgf||{};var n=e.exports=a.mgf.mgf1=a.mgf1=a.mgf1||{};n.create=function(e){var t={generate:function(t,r){for(var n=new a.util.ByteBuffer,i=Math.ceil(r/e.digestLength),s=0;s<i;s++){var o=new a.util.ByteBuffer;o.putInt32(s),e.start(),e.update(t+o.getBytes()),n.putBuffer(e.digest())}return n.truncate(n.length()-r),n.getBytes()}};return t}},function(e,t,r){function a(e,t){return e.start().update(t).digest().getBytes()}function n(e){var t;if(e){if(t=l.oids[u.derToOid(e)],!t){var r=new Error("Unsupported PRF OID.");throw r.oid=e,r.supported=["hmacWithSHA1","hmacWithSHA224","hmacWithSHA256","hmacWithSHA384","hmacWithSHA512"],r}}else t="hmacWithSHA1";return i(t)}function i(e){var t=o.md;switch(e){case"hmacWithSHA224":t=o.md.sha512;case"hmacWithSHA1":case"hmacWithSHA256":case"hmacWithSHA384":case"hmacWithSHA512":e=e.substr(8).toLowerCase();break;default:var r=new Error("Unsupported PRF algorithm.");throw r.algorithm=e,r.supported=["hmacWithSHA1","hmacWithSHA224","hmacWithSHA256","hmacWithSHA384","hmacWithSHA512"],r}if(!(t&&e in t))throw new Error("Unknown hash algorithm: "+e);return t[e].create()}function s(e,t,r,a){var n=u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OCTETSTRING,!1,e),u.create(u.Class.UNIVERSAL,u.Type.INTEGER,!1,t.getBytes())]);return"hmacWithSHA1"!==a&&n.value.push(u.create(u.Class.UNIVERSAL,u.Type.INTEGER,!1,o.util.hexToBytes(r.toString(16))),u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OID,!1,u.oidToDer(l.oids[a]).getBytes()),u.create(u.Class.UNIVERSAL,u.Type.NULL,!1,"")])),n}var o=r(0);if(r(5),r(3),r(10),r(4),r(6),r(15),r(7),r(2),r(29),r(11),r(1),"undefined"==typeof c)var c=o.jsbn.BigInteger;var u=o.asn1,l=o.pki=o.pki||{};e.exports=l.pbe=o.pbe=o.pbe||{};var p=l.oids,h={name:"EncryptedPrivateKeyInfo",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"EncryptedPrivateKeyInfo.encryptionAlgorithm",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"AlgorithmIdentifier.algorithm",tagClass:u.Class.UNIVERSAL,type:u.Type.OID,constructed:!1,capture:"encryptionOid"},{name:"AlgorithmIdentifier.parameters",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,captureAsn1:"encryptionParams"}]},{name:"EncryptedPrivateKeyInfo.encryptedData",tagClass:u.Class.UNIVERSAL,type:u.Type.OCTETSTRING,constructed:!1,capture:"encryptedData"}]},f={name:"PBES2Algorithms",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,
value:[{name:"PBES2Algorithms.keyDerivationFunc",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"PBES2Algorithms.keyDerivationFunc.oid",tagClass:u.Class.UNIVERSAL,type:u.Type.OID,constructed:!1,capture:"kdfOid"},{name:"PBES2Algorithms.params",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"PBES2Algorithms.params.salt",tagClass:u.Class.UNIVERSAL,type:u.Type.OCTETSTRING,constructed:!1,capture:"kdfSalt"},{name:"PBES2Algorithms.params.iterationCount",tagClass:u.Class.UNIVERSAL,type:u.Type.INTEGER,constructed:!1,capture:"kdfIterationCount"},{name:"PBES2Algorithms.params.keyLength",tagClass:u.Class.UNIVERSAL,type:u.Type.INTEGER,constructed:!1,optional:!0,capture:"keyLength"},{name:"PBES2Algorithms.params.prf",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,optional:!0,value:[{name:"PBES2Algorithms.params.prf.algorithm",tagClass:u.Class.UNIVERSAL,type:u.Type.OID,constructed:!1,capture:"prfOid"}]}]}]},{name:"PBES2Algorithms.encryptionScheme",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"PBES2Algorithms.encryptionScheme.oid",tagClass:u.Class.UNIVERSAL,type:u.Type.OID,constructed:!1,capture:"encOid"},{name:"PBES2Algorithms.encryptionScheme.iv",tagClass:u.Class.UNIVERSAL,type:u.Type.OCTETSTRING,constructed:!1,capture:"encIv"}]}]},d={name:"pkcs-12PbeParams",tagClass:u.Class.UNIVERSAL,type:u.Type.SEQUENCE,constructed:!0,value:[{name:"pkcs-12PbeParams.salt",tagClass:u.Class.UNIVERSAL,type:u.Type.OCTETSTRING,constructed:!1,capture:"salt"},{name:"pkcs-12PbeParams.iterations",tagClass:u.Class.UNIVERSAL,type:u.Type.INTEGER,constructed:!1,capture:"iterations"}]};l.encryptPrivateKeyInfo=function(e,t,r){r=r||{},r.saltSize=r.saltSize||8,r.count=r.count||2048,r.algorithm=r.algorithm||"aes128",r.prfAlgorithm=r.prfAlgorithm||"sha1";var a,n,c,h=o.random.getBytesSync(r.saltSize),f=r.count,d=u.integerToDer(f);if(0===r.algorithm.indexOf("aes")||"des"===r.algorithm){var y,g,v;switch(r.algorithm){case"aes128":a=16,y=16,g=p["aes128-CBC"],v=o.aes.createEncryptionCipher;break;case"aes192":a=24,y=16,g=p["aes192-CBC"],v=o.aes.createEncryptionCipher;break;case"aes256":a=32,y=16,g=p["aes256-CBC"],v=o.aes.createEncryptionCipher;break;case"des":a=8,y=8,g=p.desCBC,v=o.des.createEncryptionCipher;break;default:var m=new Error("Cannot encrypt private key. Unknown encryption algorithm.");throw m.algorithm=r.algorithm,m}var C="hmacWith"+r.prfAlgorithm.toUpperCase(),E=i(C),S=o.pkcs5.pbkdf2(t,h,f,a,E),T=o.random.getBytesSync(y),I=v(S);I.start(T),I.update(u.toDer(e)),I.finish(),c=I.output.getBytes();var A=s(h,d,a,C);n=u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OID,!1,u.oidToDer(p.pkcs5PBES2).getBytes()),u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OID,!1,u.oidToDer(p.pkcs5PBKDF2).getBytes()),A]),u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OID,!1,u.oidToDer(g).getBytes()),u.create(u.Class.UNIVERSAL,u.Type.OCTETSTRING,!1,T)])])])}else{if("3des"!==r.algorithm){var m=new Error("Cannot encrypt private key. Unknown encryption algorithm.");throw m.algorithm=r.algorithm,m}a=24;var b=new o.util.ByteBuffer(h),S=l.pbe.generatePkcs12Key(t,b,1,f,a),T=l.pbe.generatePkcs12Key(t,b,2,f,a),I=o.des.createEncryptionCipher(S);I.start(T),I.update(u.toDer(e)),I.finish(),c=I.output.getBytes(),n=u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OID,!1,u.oidToDer(p["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes()),u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[u.create(u.Class.UNIVERSAL,u.Type.OCTETSTRING,!1,h),u.create(u.Class.UNIVERSAL,u.Type.INTEGER,!1,d.getBytes())])])}var B=u.create(u.Class.UNIVERSAL,u.Type.SEQUENCE,!0,[n,u.create(u.Class.UNIVERSAL,u.Type.OCTETSTRING,!1,c)]);return B},l.decryptPrivateKeyInfo=function(e,t){var r=null,a={},n=[];if(!u.validate(e,h,a,n)){var i=new Error("Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");throw i.errors=n,i}var s=u.derToOid(a.encryptionOid),c=l.pbe.getCipher(s,a.encryptionParams,t),p=o.util.createBuffer(a.encryptedData);return c.update(p),c.finish()&&(r=u.fromDer(c.output)),r},l.encryptedPrivateKeyToPem=function(e,t){var r={type:"ENCRYPTED PRIVATE KEY",body:u.toDer(e).getBytes()};return o.pem.encode(r,{maxline:t})},l.encryptedPrivateKeyFromPem=function(e){var t=o.pem.decode(e)[0];if("ENCRYPTED PRIVATE KEY"!==t.type){var r=new Error('Could not convert encrypted private key from PEM; PEM header type is "ENCRYPTED PRIVATE KEY".');throw r.headerType=t.type,r}if(t.procType&&"ENCRYPTED"===t.procType.type)throw new Error("Could not convert encrypted private key from PEM; PEM is encrypted.");return u.fromDer(t.body)},l.encryptRsaPrivateKey=function(e,t,r){if(r=r||{},!r.legacy){var a=l.wrapRsaPrivateKey(l.privateKeyToAsn1(e));return a=l.encryptPrivateKeyInfo(a,t,r),l.encryptedPrivateKeyToPem(a)}var n,i,s,c;switch(r.algorithm){case"aes128":n="AES-128-CBC",s=16,i=o.random.getBytesSync(16),c=o.aes.createEncryptionCipher;break;case"aes192":n="AES-192-CBC",s=24,i=o.random.getBytesSync(16),c=o.aes.createEncryptionCipher;break;case"aes256":n="AES-256-CBC",s=32,i=o.random.getBytesSync(16),c=o.aes.createEncryptionCipher;break;case"3des":n="DES-EDE3-CBC",s=24,i=o.random.getBytesSync(8),c=o.des.createEncryptionCipher;break;case"des":n="DES-CBC",s=8,i=o.random.getBytesSync(8),c=o.des.createEncryptionCipher;break;default:var p=new Error('Could not encrypt RSA private key; unsupported encryption algorithm "'+r.algorithm+'".');throw p.algorithm=r.algorithm,p}var h=o.pbe.opensslDeriveBytes(t,i.substr(0,8),s),f=c(h);f.start(i),f.update(u.toDer(l.privateKeyToAsn1(e))),f.finish();var d={type:"RSA PRIVATE KEY",procType:{version:"4",type:"ENCRYPTED"},dekInfo:{algorithm:n,parameters:o.util.bytesToHex(i).toUpperCase()},body:f.output.getBytes()};return o.pem.encode(d)},l.decryptRsaPrivateKey=function(e,t){var r=null,a=o.pem.decode(e)[0];if("ENCRYPTED PRIVATE KEY"!==a.type&&"PRIVATE KEY"!==a.type&&"RSA PRIVATE KEY"!==a.type){var n=new Error('Could not convert private key from PEM; PEM header type is not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".');throw n.headerType=n,n}if(a.procType&&"ENCRYPTED"===a.procType.type){var i,s;switch(a.dekInfo.algorithm){case"DES-CBC":i=8,s=o.des.createDecryptionCipher;break;case"DES-EDE3-CBC":i=24,s=o.des.createDecryptionCipher;break;case"AES-128-CBC":i=16,s=o.aes.createDecryptionCipher;break;case"AES-192-CBC":i=24,s=o.aes.createDecryptionCipher;break;case"AES-256-CBC":i=32,s=o.aes.createDecryptionCipher;break;case"RC2-40-CBC":i=5,s=function(e){return o.rc2.createDecryptionCipher(e,40)};break;case"RC2-64-CBC":i=8,s=function(e){return o.rc2.createDecryptionCipher(e,64)};break;case"RC2-128-CBC":i=16,s=function(e){return o.rc2.createDecryptionCipher(e,128)};break;default:var n=new Error('Could not decrypt private key; unsupported encryption algorithm "'+a.dekInfo.algorithm+'".');throw n.algorithm=a.dekInfo.algorithm,n}var c=o.util.hexToBytes(a.dekInfo.parameters),p=o.pbe.opensslDeriveBytes(t,c.substr(0,8),i),h=s(p);if(h.start(c),h.update(o.util.createBuffer(a.body)),!h.finish())return r;r=h.output.getBytes()}else r=a.body;return r="ENCRYPTED PRIVATE KEY"===a.type?l.decryptPrivateKeyInfo(u.fromDer(r),t):u.fromDer(r),null!==r&&(r=l.privateKeyFromAsn1(r)),r},l.pbe.generatePkcs12Key=function(e,t,r,a,n,i){var s,c;if("undefined"==typeof i||null===i){if(!("sha1"in o.md))throw new Error('"sha1" hash algorithm unavailable.');i=o.md.sha1.create()}var u=i.digestLength,l=i.blockLength,p=new o.util.ByteBuffer,h=new o.util.ByteBuffer;if(null!==e&&void 0!==e){for(c=0;c<e.length;c++)h.putInt16(e.charCodeAt(c));h.putInt16(0)}var f=h.length(),d=t.length(),y=new o.util.ByteBuffer;y.fillWithByte(r,l);var g=l*Math.ceil(d/l),v=new o.util.ByteBuffer;for(c=0;c<g;c++)v.putByte(t.at(c%d));var m=l*Math.ceil(f/l),C=new o.util.ByteBuffer;for(c=0;c<m;c++)C.putByte(h.at(c%f));var E=v;E.putBuffer(C);for(var S=Math.ceil(n/u),T=1;T<=S;T++){var I=new o.util.ByteBuffer;I.putBytes(y.bytes()),I.putBytes(E.bytes());for(var A=0;A<a;A++)i.start(),i.update(I.getBytes()),I=i.digest();var b=new o.util.ByteBuffer;for(c=0;c<l;c++)b.putByte(I.at(c%u));var B=Math.ceil(d/l)+Math.ceil(f/l),N=new o.util.ByteBuffer;for(s=0;s<B;s++){var k=new o.util.ByteBuffer(E.getBytes(l)),R=511;for(c=b.length()-1;c>=0;c--)R>>=8,R+=b.at(c)+k.at(c),k.setAt(c,255&R);N.putBuffer(k)}E=N,p.putBuffer(I)}return p.truncate(p.length()-n),p},l.pbe.getCipher=function(e,t,r){switch(e){case l.oids.pkcs5PBES2:return l.pbe.getCipherForPBES2(e,t,r);case l.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:case l.oids["pbewithSHAAnd40BitRC2-CBC"]:return l.pbe.getCipherForPKCS12PBE(e,t,r);default:var a=new Error("Cannot read encrypted PBE data block. Unsupported OID.");throw a.oid=e,a.supportedOids=["pkcs5PBES2","pbeWithSHAAnd3-KeyTripleDES-CBC","pbewithSHAAnd40BitRC2-CBC"],a}},l.pbe.getCipherForPBES2=function(e,t,r){var a={},i=[];if(!u.validate(t,f,a,i)){var s=new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");throw s.errors=i,s}if(e=u.derToOid(a.kdfOid),e!==l.oids.pkcs5PBKDF2){var s=new Error("Cannot read encrypted private key. Unsupported key derivation function OID.");throw s.oid=e,s.supportedOids=["pkcs5PBKDF2"],s}if(e=u.derToOid(a.encOid),e!==l.oids["aes128-CBC"]&&e!==l.oids["aes192-CBC"]&&e!==l.oids["aes256-CBC"]&&e!==l.oids["des-EDE3-CBC"]&&e!==l.oids.desCBC){var s=new Error("Cannot read encrypted private key. Unsupported encryption scheme OID.");throw s.oid=e,s.supportedOids=["aes128-CBC","aes192-CBC","aes256-CBC","des-EDE3-CBC","desCBC"],s}var c=a.kdfSalt,p=o.util.createBuffer(a.kdfIterationCount);p=p.getInt(p.length()<<3);var h,d;switch(l.oids[e]){case"aes128-CBC":h=16,d=o.aes.createDecryptionCipher;break;case"aes192-CBC":h=24,d=o.aes.createDecryptionCipher;break;case"aes256-CBC":h=32,d=o.aes.createDecryptionCipher;break;case"des-EDE3-CBC":h=24,d=o.des.createDecryptionCipher;break;case"desCBC":h=8,d=o.des.createDecryptionCipher}var y=n(a.prfOid),g=o.pkcs5.pbkdf2(r,c,p,h,y),v=a.encIv,m=d(g);return m.start(v),m},l.pbe.getCipherForPKCS12PBE=function(e,t,r){var a={},i=[];if(!u.validate(t,d,a,i)){var s=new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");throw s.errors=i,s}var c=o.util.createBuffer(a.salt),p=o.util.createBuffer(a.iterations);p=p.getInt(p.length()<<3);var h,f,y;switch(e){case l.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:h=24,f=8,y=o.des.startDecrypting;break;case l.oids["pbewithSHAAnd40BitRC2-CBC"]:h=5,f=8,y=function(e,t){var r=o.rc2.createDecryptionCipher(e,40);return r.start(t,null),r};break;default:var s=new Error("Cannot read PKCS #12 PBE data block. Unsupported OID.");throw s.oid=e,s}var g=n(a.prfOid),v=l.pbe.generatePkcs12Key(r,c,1,p,h,g);g.start();var m=l.pbe.generatePkcs12Key(r,c,2,p,f,g);return y(v,m)},l.pbe.opensslDeriveBytes=function(e,t,r,n){if("undefined"==typeof n||null===n){if(!("md5"in o.md))throw new Error('"md5" hash algorithm unavailable.');n=o.md.md5.create()}null===t&&(t="");for(var i=[a(n,e+t)],s=16,c=1;s<r;++c,s+=16)i.push(a(n,i[c-1]+e+t));return i.join("").substr(0,r)}},function(e,t,r){function a(e,t,r){r||(r=n.md.sha1.create());for(var a="",i=Math.ceil(t/r.digestLength),s=0;s<i;++s){var o=String.fromCharCode(s>>24&255,s>>16&255,s>>8&255,255&s);r.start(),r.update(e+o),a+=r.digest().getBytes()}return a.substring(0,t)}var n=r(0);r(1),r(2),r(9);var i=e.exports=n.pkcs1=n.pkcs1||{};i.encode_rsa_oaep=function(e,t,r){var i,s,o,c;"string"==typeof r?(i=r,s=arguments[3]||void 0,o=arguments[4]||void 0):r&&(i=r.label||void 0,s=r.seed||void 0,o=r.md||void 0,r.mgf1&&r.mgf1.md&&(c=r.mgf1.md)),o?o.start():o=n.md.sha1.create(),c||(c=o);var u=Math.ceil(e.n.bitLength()/8),l=u-2*o.digestLength-2;if(t.length>l){var p=new Error("RSAES-OAEP input message length is too long.");throw p.length=t.length,p.maxLength=l,p}i||(i=""),o.update(i,"raw");for(var h=o.digest(),f="",d=l-t.length,y=0;y<d;y++)f+="\0";var g=h.getBytes()+f+""+t;if(s){if(s.length!==o.digestLength){var p=new Error("Invalid RSAES-OAEP seed. The seed length must match the digest length.");throw p.seedLength=s.length,p.digestLength=o.digestLength,p}}else s=n.random.getBytes(o.digestLength);var v=a(s,u-o.digestLength-1,c),m=n.util.xorBytes(g,v,g.length),C=a(m,o.digestLength,c),E=n.util.xorBytes(s,C,s.length);return"\0"+E+m},i.decode_rsa_oaep=function(e,t,r){var i,s,o;"string"==typeof r?(i=r,s=arguments[3]||void 0):r&&(i=r.label||void 0,s=r.md||void 0,r.mgf1&&r.mgf1.md&&(o=r.mgf1.md));var c=Math.ceil(e.n.bitLength()/8);if(t.length!==c){var u=new Error("RSAES-OAEP encoded message length is invalid.");throw u.length=t.length,u.expectedLength=c,u}if(void 0===s?s=n.md.sha1.create():s.start(),o||(o=s),c<2*s.digestLength+2)throw new Error("RSAES-OAEP key is too short for the hash function.");i||(i=""),s.update(i,"raw");for(var l=s.digest().getBytes(),p=t.charAt(0),h=t.substring(1,s.digestLength+1),f=t.substring(1+s.digestLength),d=a(f,s.digestLength,o),y=n.util.xorBytes(h,d,h.length),g=a(y,c-s.digestLength-1,o),v=n.util.xorBytes(f,g,f.length),m=v.substring(0,s.digestLength),u="\0"!==p,C=0;C<s.digestLength;++C)u|=l.charAt(C)!==m.charAt(C);for(var E=1,S=s.digestLength,T=s.digestLength;T<v.length;T++){var I=v.charCodeAt(T),A=1&I^1,b=E?65534:0;u|=I&b,E&=A,S+=E}if(u||1!==v.charCodeAt(S))throw new Error("Invalid RSAES-OAEP padding.");return v.substring(S+1)}},function(e,t,r){function a(e,t,r,a){for(var n=[],i=0;i<e.length;i++)for(var s=0;s<e[i].safeBags.length;s++){var o=e[i].safeBags[s];void 0!==a&&o.type!==a||(null!==t?void 0!==o.attributes[t]&&o.attributes[t].indexOf(r)>=0&&n.push(o):n.push(o))}return n}function n(e){if(e.composed||e.constructed){for(var t=u.util.createBuffer(),r=0;r<e.value.length;++r)t.putBytes(e.value[r].value);e.composed=e.constructed=!1,e.value=t.getBytes()}return e}function i(e,t,r,a){if(t=l.fromDer(t,r),t.tagClass!==l.Class.UNIVERSAL||t.type!==l.Type.SEQUENCE||t.constructed!==!0)throw new Error("PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo");for(var i=0;i<t.value.length;i++){var c=t.value[i],u={},h=[];if(!l.validate(c,f,u,h)){var d=new Error("Cannot read ContentInfo.");throw d.errors=h,d}var y={encrypted:!1},g=null,v=u.content.value[0];switch(l.derToOid(u.contentType)){case p.oids.data:if(v.tagClass!==l.Class.UNIVERSAL||v.type!==l.Type.OCTETSTRING)throw new Error("PKCS#12 SafeContents Data is not an OCTET STRING.");g=n(v).value;break;case p.oids.encryptedData:g=s(v,a),y.encrypted=!0;break;default:var d=new Error("Unsupported PKCS#12 contentType.");throw d.contentType=l.derToOid(u.contentType),d}y.safeBags=o(g,r,a),e.safeContents.push(y)}}function s(e,t){var r={},a=[];if(!l.validate(e,u.pkcs7.asn1.encryptedDataValidator,r,a)){var i=new Error("Cannot read EncryptedContentInfo.");throw i.errors=a,i}var s=l.derToOid(r.contentType);if(s!==p.oids.data){var i=new Error("PKCS#12 EncryptedContentInfo ContentType is not Data.");throw i.oid=s,i}s=l.derToOid(r.encAlgorithm);var o=p.pbe.getCipher(s,r.encParameter,t),c=n(r.encryptedContentAsn1),h=u.util.createBuffer(c.value);if(o.update(h),!o.finish())throw new Error("Failed to decrypt PKCS#12 SafeContents.");return o.output.getBytes()}function o(e,t,r){if(!t&&0===e.length)return[];if(e=l.fromDer(e,t),e.tagClass!==l.Class.UNIVERSAL||e.type!==l.Type.SEQUENCE||e.constructed!==!0)throw new Error("PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag.");for(var a=[],n=0;n<e.value.length;n++){var i=e.value[n],s={},o=[];if(!l.validate(i,y,s,o)){var u=new Error("Cannot read SafeBag.");throw u.errors=o,u}var h={type:l.derToOid(s.bagId),attributes:c(s.bagAttributes)};a.push(h);var f,d,g=s.bagValue.value[0];switch(h.type){case p.oids.pkcs8ShroudedKeyBag:if(g=p.decryptPrivateKeyInfo(g,r),null===g)throw new Error("Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?");case p.oids.keyBag:try{h.key=p.privateKeyFromAsn1(g)}catch(e){h.key=null,h.asn1=g}continue;case p.oids.certBag:f=v,d=function(){if(l.derToOid(s.certId)!==p.oids.x509Certificate){var e=new Error("Unsupported certificate type, only X.509 supported.");throw e.oid=l.derToOid(s.certId),e}var r=l.fromDer(s.cert,t);try{h.cert=p.certificateFromAsn1(r,!0)}catch(e){h.cert=null,h.asn1=r}};break;default:var u=new Error("Unsupported PKCS#12 SafeBag type.");throw u.oid=h.type,u}if(void 0!==f&&!l.validate(g,f,s,o)){var u=new Error("Cannot read PKCS#12 "+f.name);throw u.errors=o,u}d()}return a}function c(e){var t={};if(void 0!==e)for(var r=0;r<e.length;++r){var a={},n=[];if(!l.validate(e[r],g,a,n)){var i=new Error("Cannot read PKCS#12 BagAttribute.");throw i.errors=n,i}var s=l.derToOid(a.oid);if(void 0!==p.oids[s]){t[p.oids[s]]=[];for(var o=0;o<a.values.length;++o)t[p.oids[s]].push(a.values[o].value)}}return t}var u=r(0);r(3),r(8),r(6),r(25),r(22),r(2),r(11),r(9),r(1),r(17);var l=u.asn1,p=u.pki,h=e.exports=u.pkcs12=u.pkcs12||{},f={name:"ContentInfo",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"ContentInfo.contentType",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"contentType"},{name:"ContentInfo.content",tagClass:l.Class.CONTEXT_SPECIFIC,constructed:!0,captureAsn1:"content"}]},d={name:"PFX",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"PFX.version",tagClass:l.Class.UNIVERSAL,type:l.Type.INTEGER,constructed:!1,capture:"version"},f,{name:"PFX.macData",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,optional:!0,captureAsn1:"mac",value:[{name:"PFX.macData.mac",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"PFX.macData.mac.digestAlgorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"PFX.macData.mac.digestAlgorithm.algorithm",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"macAlgorithm"},{name:"PFX.macData.mac.digestAlgorithm.parameters",tagClass:l.Class.UNIVERSAL,captureAsn1:"macAlgorithmParameters"}]},{name:"PFX.macData.mac.digest",tagClass:l.Class.UNIVERSAL,type:l.Type.OCTETSTRING,constructed:!1,capture:"macDigest"}]},{name:"PFX.macData.macSalt",tagClass:l.Class.UNIVERSAL,type:l.Type.OCTETSTRING,constructed:!1,capture:"macSalt"},{name:"PFX.macData.iterations",tagClass:l.Class.UNIVERSAL,type:l.Type.INTEGER,constructed:!1,optional:!0,capture:"macIterations"}]}]},y={name:"SafeBag",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"SafeBag.bagId",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"bagId"},{name:"SafeBag.bagValue",tagClass:l.Class.CONTEXT_SPECIFIC,constructed:!0,captureAsn1:"bagValue"},{name:"SafeBag.bagAttributes",tagClass:l.Class.UNIVERSAL,type:l.Type.SET,constructed:!0,optional:!0,capture:"bagAttributes"}]},g={name:"Attribute",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"Attribute.attrId",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"oid"},{name:"Attribute.attrValues",tagClass:l.Class.UNIVERSAL,type:l.Type.SET,constructed:!0,capture:"values"}]},v={name:"CertBag",tagClass:l.Class.UNIVERSAL,type:l.Type.SEQUENCE,constructed:!0,value:[{name:"CertBag.certId",tagClass:l.Class.UNIVERSAL,type:l.Type.OID,constructed:!1,capture:"certId"},{name:"CertBag.certValue",tagClass:l.Class.CONTEXT_SPECIFIC,constructed:!0,value:[{name:"CertBag.certValue[0]",tagClass:l.Class.UNIVERSAL,type:l.Class.OCTETSTRING,constructed:!1,capture:"cert"}]}]};h.pkcs12FromAsn1=function(e,t,r){"string"==typeof t?(r=t,t=!0):void 0===t&&(t=!0);var s={},o=[];if(!l.validate(e,d,s,o)){var c=new Error("Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.");throw c.errors=c,c}var f={version:s.version.charCodeAt(0),safeContents:[],getBags:function(e){var t,r={};return"localKeyId"in e?t=e.localKeyId:"localKeyIdHex"in e&&(t=u.util.hexToBytes(e.localKeyIdHex)),void 0===t&&!("friendlyName"in e)&&"bagType"in e&&(r[e.bagType]=a(f.safeContents,null,null,e.bagType)),void 0!==t&&(r.localKeyId=a(f.safeContents,"localKeyId",t,e.bagType)),"friendlyName"in e&&(r.friendlyName=a(f.safeContents,"friendlyName",e.friendlyName,e.bagType)),r},getBagsByFriendlyName:function(e,t){return a(f.safeContents,"friendlyName",e,t)},getBagsByLocalKeyId:function(e,t){return a(f.safeContents,"localKeyId",e,t)}};if(3!==s.version.charCodeAt(0)){var c=new Error("PKCS#12 PFX of version other than 3 not supported.");throw c.version=s.version.charCodeAt(0),c}if(l.derToOid(s.contentType)!==p.oids.data){var c=new Error("Only PKCS#12 PFX in password integrity mode supported.");throw c.oid=l.derToOid(s.contentType),c}var y=s.content.value[0];if(y.tagClass!==l.Class.UNIVERSAL||y.type!==l.Type.OCTETSTRING)throw new Error("PKCS#12 authSafe content data is not an OCTET STRING.");if(y=n(y),s.mac){var g=null,v=0,m=l.derToOid(s.macAlgorithm);switch(m){case p.oids.sha1:g=u.md.sha1.create(),v=20;break;case p.oids.sha256:g=u.md.sha256.create(),v=32;break;case p.oids.sha384:g=u.md.sha384.create(),v=48;break;case p.oids.sha512:g=u.md.sha512.create(),v=64;break;case p.oids.md5:g=u.md.md5.create(),v=16}if(null===g)throw new Error("PKCS#12 uses unsupported MAC algorithm: "+m);var C=new u.util.ByteBuffer(s.macSalt),E="macIterations"in s?parseInt(u.util.bytesToHex(s.macIterations),16):1,S=h.generateKey(r,C,3,E,v,g),T=u.hmac.create();T.start(g,S),T.update(y.value);var I=T.getMac();if(I.getBytes()!==s.macDigest)throw new Error("PKCS#12 MAC could not be verified. Invalid password?")}return i(f,y.value,t,r),f},h.toPkcs12Asn1=function(e,t,r,a){a=a||{},a.saltSize=a.saltSize||8,a.count=a.count||2048,a.algorithm=a.algorithm||a.encAlgorithm||"aes128","useMac"in a||(a.useMac=!0),"localKeyId"in a||(a.localKeyId=null),"generateLocalKeyId"in a||(a.generateLocalKeyId=!0);var n,i=a.localKeyId;if(null!==i)i=u.util.hexToBytes(i);else if(a.generateLocalKeyId)if(t){var s=u.util.isArray(t)?t[0]:t;"string"==typeof s&&(s=p.certificateFromPem(s));var o=u.md.sha1.create();o.update(l.toDer(p.certificateToAsn1(s)).getBytes()),i=o.digest().getBytes()}else i=u.random.getBytes(20);var c=[];null!==i&&c.push(l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.localKeyId).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.SET,!0,[l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,i)])])),"friendlyName"in a&&c.push(l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.friendlyName).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.SET,!0,[l.create(l.Class.UNIVERSAL,l.Type.BMPSTRING,!1,a.friendlyName)])])),c.length>0&&(n=l.create(l.Class.UNIVERSAL,l.Type.SET,!0,c));var f=[],d=[];null!==t&&(d=u.util.isArray(t)?t:[t]);for(var y=[],g=0;g<d.length;++g){t=d[g],"string"==typeof t&&(t=p.certificateFromPem(t));var v=0===g?n:void 0,m=p.certificateToAsn1(t),C=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.certBag).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.x509Certificate).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,l.toDer(m).getBytes())])])]),v]);y.push(C)}if(y.length>0){var E=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,y),S=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.data).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,l.toDer(E).getBytes())])]);f.push(S)}var T=null;if(null!==e){var I=p.wrapRsaPrivateKey(p.privateKeyToAsn1(e));T=null===r?l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.keyBag).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[I]),n]):l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.pkcs8ShroudedKeyBag).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[p.encryptPrivateKeyInfo(I,r,a)]),n]);var A=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[T]),b=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.data).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,l.toDer(A).getBytes())])]);f.push(b)}var B,N=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,f);if(a.useMac){var o=u.md.sha1.create(),k=new u.util.ByteBuffer(u.random.getBytes(a.saltSize)),R=a.count,e=h.generateKey(r,k,3,R,20),w=u.hmac.create();w.start(o,e),w.update(l.toDer(N).getBytes());var L=w.getMac();B=l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.sha1).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.NULL,!1,"")]),l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,L.getBytes())]),l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,k.getBytes()),l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(R).getBytes())])}return l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.INTEGER,!1,l.integerToDer(3).getBytes()),l.create(l.Class.UNIVERSAL,l.Type.SEQUENCE,!0,[l.create(l.Class.UNIVERSAL,l.Type.OID,!1,l.oidToDer(p.oids.data).getBytes()),l.create(l.Class.CONTEXT_SPECIFIC,0,!0,[l.create(l.Class.UNIVERSAL,l.Type.OCTETSTRING,!1,l.toDer(N).getBytes())])]),B])},h.generateKey=u.pbe.generatePkcs12Key},function(e,t,r){var a=r(0);r(3),r(1);var n=a.asn1,i=e.exports=a.pkcs7asn1=a.pkcs7asn1||{};a.pkcs7=a.pkcs7||{},a.pkcs7.asn1=i;var s={name:"ContentInfo",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"ContentInfo.ContentType",tagClass:n.Class.UNIVERSAL,type:n.Type.OID,constructed:!1,capture:"contentType"},{name:"ContentInfo.content",tagClass:n.Class.CONTEXT_SPECIFIC,type:0,constructed:!0,optional:!0,captureAsn1:"content"}]};i.contentInfoValidator=s;var o={name:"EncryptedContentInfo",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"EncryptedContentInfo.contentType",tagClass:n.Class.UNIVERSAL,type:n.Type.OID,constructed:!1,capture:"contentType"},{name:"EncryptedContentInfo.contentEncryptionAlgorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"EncryptedContentInfo.contentEncryptionAlgorithm.algorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.OID,constructed:!1,capture:"encAlgorithm"},{name:"EncryptedContentInfo.contentEncryptionAlgorithm.parameter",tagClass:n.Class.UNIVERSAL,captureAsn1:"encParameter"}]},{name:"EncryptedContentInfo.encryptedContent",tagClass:n.Class.CONTEXT_SPECIFIC,type:0,capture:"encryptedContent",captureAsn1:"encryptedContentAsn1"}]};i.envelopedDataValidator={name:"EnvelopedData",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"EnvelopedData.Version",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"version"},{name:"EnvelopedData.RecipientInfos",tagClass:n.Class.UNIVERSAL,type:n.Type.SET,constructed:!0,captureAsn1:"recipientInfos"}].concat(o)},i.encryptedDataValidator={name:"EncryptedData",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"EncryptedData.Version",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"version"}].concat(o)};var c={name:"SignerInfo",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"SignerInfo.version",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1},{name:"SignerInfo.issuerAndSerialNumber",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"SignerInfo.issuerAndSerialNumber.issuer",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,captureAsn1:"issuer"},{name:"SignerInfo.issuerAndSerialNumber.serialNumber",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"serial"}]},{name:"SignerInfo.digestAlgorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"SignerInfo.digestAlgorithm.algorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.OID,constructed:!1,capture:"digestAlgorithm"},{name:"SignerInfo.digestAlgorithm.parameter",tagClass:n.Class.UNIVERSAL,constructed:!1,captureAsn1:"digestParameter",optional:!0}]},{name:"SignerInfo.authenticatedAttributes",tagClass:n.Class.CONTEXT_SPECIFIC,type:0,constructed:!0,optional:!0,capture:"authenticatedAttributes"},{name:"SignerInfo.digestEncryptionAlgorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,capture:"signatureAlgorithm"},{name:"SignerInfo.encryptedDigest",tagClass:n.Class.UNIVERSAL,type:n.Type.OCTETSTRING,constructed:!1,capture:"signature"},{name:"SignerInfo.unauthenticatedAttributes",tagClass:n.Class.CONTEXT_SPECIFIC,type:1,constructed:!0,optional:!0,capture:"unauthenticatedAttributes"}]};i.signedDataValidator={name:"SignedData",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"SignedData.Version",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"version"},{name:"SignedData.DigestAlgorithms",tagClass:n.Class.UNIVERSAL,type:n.Type.SET,constructed:!0,captureAsn1:"digestAlgorithms"},s,{name:"SignedData.Certificates",tagClass:n.Class.CONTEXT_SPECIFIC,type:0,optional:!0,captureAsn1:"certificates"},{name:"SignedData.CertificateRevocationLists",tagClass:n.Class.CONTEXT_SPECIFIC,type:1,optional:!0,captureAsn1:"crls"},{name:"SignedData.SignerInfos",tagClass:n.Class.UNIVERSAL,type:n.Type.SET,capture:"signerInfos",optional:!0,value:[c]}]},i.recipientInfoValidator={name:"RecipientInfo",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"RecipientInfo.version",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"version"},{name:"RecipientInfo.issuerAndSerial",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"RecipientInfo.issuerAndSerial.issuer",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,captureAsn1:"issuer"},{name:"RecipientInfo.issuerAndSerial.serialNumber",tagClass:n.Class.UNIVERSAL,type:n.Type.INTEGER,constructed:!1,capture:"serial"}]},{name:"RecipientInfo.keyEncryptionAlgorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.SEQUENCE,constructed:!0,value:[{name:"RecipientInfo.keyEncryptionAlgorithm.algorithm",tagClass:n.Class.UNIVERSAL,type:n.Type.OID,constructed:!1,capture:"encAlgorithm"},{name:"RecipientInfo.keyEncryptionAlgorithm.parameter",tagClass:n.Class.UNIVERSAL,constructed:!1,captureAsn1:"encParameter"}]},{name:"RecipientInfo.encryptedKey",tagClass:n.Class.UNIVERSAL,type:n.Type.OCTETSTRING,constructed:!1,capture:"encKey"}]}},function(e,t,r){var a=r(0);r(3),r(6),r(22),r(7),r(15),r(24),r(16),r(11),r(1),r(17);var n=a.asn1,i=e.exports=a.pki=a.pki||{};i.pemToDer=function(e){var t=a.pem.decode(e)[0];if(t.procType&&"ENCRYPTED"===t.procType.type)throw new Error("Could not convert PEM to DER; PEM is encrypted.");return a.util.createBuffer(t.body)},i.privateKeyFromPem=function(e){var t=a.pem.decode(e)[0];if("PRIVATE KEY"!==t.type&&"RSA PRIVATE KEY"!==t.type){var r=new Error('Could not convert private key from PEM; PEM header type is not "PRIVATE KEY" or "RSA PRIVATE KEY".');throw r.headerType=t.type,r}if(t.procType&&"ENCRYPTED"===t.procType.type)throw new Error("Could not convert private key from PEM; PEM is encrypted.");var s=n.fromDer(t.body);return i.privateKeyFromAsn1(s)},i.privateKeyToPem=function(e,t){var r={type:"RSA PRIVATE KEY",body:n.toDer(i.privateKeyToAsn1(e)).getBytes()};return a.pem.encode(r,{maxline:t})},i.privateKeyInfoToPem=function(e,t){var r={type:"PRIVATE KEY",body:n.toDer(e).getBytes()};return a.pem.encode(r,{maxline:t})}},function(e,t,r){var a=r(0);r(1),r(13),r(2),function(){function t(e,t,a,n){return"workers"in a?i(e,t,a,n):r(e,t,a,n)}function r(e,t,r,a){var i=s(e,t),c=0,u=o(i.bitLength());"millerRabinTests"in r&&(u=r.millerRabinTests);var l=10;
"maxBlockTime"in r&&(l=r.maxBlockTime),n(i,e,t,c,u,l,a)}function n(e,t,r,i,o,c,u){var p=+new Date;do{if(e.bitLength()>t&&(e=s(t,r)),e.isProbablePrime(o))return u(null,e);e.dAddOffset(l[i++%8],0)}while(c<0||+new Date-p<c);a.util.setImmediate(function(){n(e,t,r,i,o,c,u)})}function i(e,t,n,i){function o(){function r(r){if(!d){--o;var n=r.data;if(n.found){for(var l=0;l<a.length;++l)a[l].terminate();return d=!0,i(null,new u(n.prime,16))}c.bitLength()>e&&(c=s(e,t));var f=c.toString(16);r.target.postMessage({hex:f,workLoad:p}),c.dAddOffset(h,0)}}l=Math.max(1,l);for(var a=[],n=0;n<l;++n)a[n]=new Worker(f);for(var o=l,n=0;n<l;++n)a[n].addEventListener("message",r);var d=!1}if("undefined"==typeof Worker)return r(e,t,n,i);var c=s(e,t),l=n.workers,p=n.workLoad||100,h=30*p/8,f=n.workerScript||"forge/prime.worker.js";return l===-1?a.util.estimateCores(function(e,t){e&&(t=2),l=t-1,o()}):void o()}function s(e,t){var r=new u(e,t),a=e-1;return r.testBit(a)||r.bitwiseTo(u.ONE.shiftLeft(a),h,r),r.dAddOffset(31-r.mod(p).byteValue(),0),r}function o(e){return e<=100?27:e<=150?18:e<=200?15:e<=250?12:e<=300?9:e<=350?8:e<=400?7:e<=500?6:e<=600?5:e<=800?4:e<=1250?3:2}if(a.prime)return void(e.exports=a.prime);var c=e.exports=a.prime=a.prime||{},u=a.jsbn.BigInteger,l=[6,4,2,4,2,4,6,2],p=new u(null);p.fromInt(30);var h=function(e,t){return e|t};c.generateProbablePrime=function(e,r,n){"function"==typeof r&&(n=r,r={}),r=r||{};var i=r.algorithm||"PRIMEINC";"string"==typeof i&&(i={name:i}),i.options=i.options||{};var s=r.prng||a.random,o={nextBytes:function(e){for(var t=s.getBytesSync(e.length),r=0;r<e.length;++r)e[r]=t.charCodeAt(r)}};if("PRIMEINC"===i.name)return t(e,o,i.options,n);throw new Error("Invalid prime generation algorithm: "+i.name)}}()},function(e,t,r){var a=r(0);r(1);var n=null;!a.util.isNodejs||a.options.usePureJavaScript||process.versions["node-webkit"]||(n=r(32));var i=e.exports=a.prng=a.prng||{};i.create=function(e){function t(e){if(o.pools[0].messageLength>=32)return i(),e();var t=32-o.pools[0].messageLength<<5;o.seedFile(t,function(t,r){return t?e(t):(o.collect(r),i(),void e())})}function r(){if(o.pools[0].messageLength>=32)return i();var e=32-o.pools[0].messageLength<<5;o.collect(o.seedFileSync(e)),i()}function i(){var e=o.plugin.md.create();e.update(o.pools[0].digest().getBytes()),o.pools[0].start();for(var t=1,r=1;r<32;++r)t=31===t?2147483648:t<<2,t%o.reseeds===0&&(e.update(o.pools[r].digest().getBytes()),o.pools[r].start());var a=e.digest().getBytes();e.start(),e.update(a);var n=e.digest().getBytes();o.key=o.plugin.formatKey(a),o.seed=o.plugin.formatSeed(n),o.reseeds=4294967295===o.reseeds?0:o.reseeds+1,o.generated=0}function s(e){var t=null;if("undefined"!=typeof window){var r=window.crypto||window.msCrypto;r&&r.getRandomValues&&(t=function(e){return r.getRandomValues(e)})}var n=a.util.createBuffer();if(t)for(;n.length()<e;){var i=Math.max(1,Math.min(e-n.length(),65536)/4),s=new Uint32Array(Math.floor(i));try{t(s);for(var o=0;o<s.length;++o)n.putInt32(s[o])}catch(e){if(!("undefined"!=typeof QuotaExceededError&&e instanceof QuotaExceededError))throw e}}if(n.length()<e)for(var c,u,l,p=Math.floor(65536*Math.random());n.length()<e;){u=16807*(65535&p),c=16807*(p>>16),u+=(32767&c)<<16,u+=c>>15,u=(2147483647&u)+(u>>31),p=4294967295&u;for(var o=0;o<3;++o)l=p>>>(o<<3),l^=Math.floor(256*Math.random()),n.putByte(String.fromCharCode(255&l))}return n.getBytes(e)}for(var o={plugin:e,key:null,seed:null,time:null,reseeds:0,generated:0},c=e.md,u=new Array(32),l=0;l<32;++l)u[l]=c.create();return o.pools=u,o.pool=0,o.generate=function(e,r){function n(p){if(p)return r(p);if(l.length()>=e)return r(null,l.getBytes(e));if(o.generated>1048575&&(o.key=null),null===o.key)return a.util.nextTick(function(){t(n)});var h=i(o.key,o.seed);o.generated+=h.length,l.putBytes(h),o.key=c(i(o.key,s(o.seed))),o.seed=u(i(o.key,o.seed)),a.util.setImmediate(n)}if(!r)return o.generateSync(e);var i=o.plugin.cipher,s=o.plugin.increment,c=o.plugin.formatKey,u=o.plugin.formatSeed,l=a.util.createBuffer();o.key=null,n()},o.generateSync=function(e){var t=o.plugin.cipher,n=o.plugin.increment,i=o.plugin.formatKey,s=o.plugin.formatSeed;o.key=null;for(var c=a.util.createBuffer();c.length()<e;){o.generated>1048575&&(o.key=null),null===o.key&&r();var u=t(o.key,o.seed);o.generated+=u.length,c.putBytes(u),o.key=i(t(o.key,n(o.seed))),o.seed=s(t(o.key,o.seed))}return c.getBytes(e)},n?(o.seedFile=function(e,t){n.randomBytes(e,function(e,r){return e?t(e):void t(null,r.toString())})},o.seedFileSync=function(e){return n.randomBytes(e).toString()}):(o.seedFile=function(e,t){try{t(null,s(e))}catch(e){t(e)}},o.seedFileSync=s),o.collect=function(e){for(var t=e.length,r=0;r<t;++r)o.pools[o.pool].update(e.substr(r,1)),o.pool=31===o.pool?0:o.pool+1},o.collectInt=function(e,t){for(var r="",a=0;a<t;a+=8)r+=String.fromCharCode(e>>a&255);o.collect(r)},o.registerWorker=function(e){if(e===self)o.seedFile=function(e,t){function r(e){var a=e.data;a.forge&&a.forge.prng&&(self.removeEventListener("message",r),t(a.forge.prng.err,a.forge.prng.bytes))}self.addEventListener("message",r),self.postMessage({forge:{prng:{needed:e}}})};else{var t=function(t){var r=t.data;r.forge&&r.forge.prng&&o.seedFile(r.forge.prng.needed,function(t,r){e.postMessage({forge:{prng:{err:t,bytes:r}}})})};e.addEventListener("message",t)}},o}},function(e,t,r){var a=r(0);r(1);var n=[217,120,249,196,25,221,181,237,40,233,253,121,74,160,216,157,198,126,55,131,43,118,83,142,98,76,100,136,68,139,251,162,23,154,89,245,135,179,79,19,97,69,109,141,9,129,125,50,189,143,64,235,134,183,123,11,240,149,33,34,92,107,78,130,84,214,101,147,206,96,178,28,115,86,192,20,167,140,241,220,18,117,202,31,59,190,228,209,66,61,212,48,163,60,182,38,111,191,14,218,70,105,7,87,39,242,29,155,188,148,67,3,248,17,199,246,144,239,62,231,6,195,213,47,200,102,30,215,8,232,234,222,128,82,238,247,132,170,114,172,53,77,106,42,150,26,210,113,90,21,73,116,75,159,208,94,4,24,164,236,194,224,65,110,15,81,203,204,36,145,175,80,161,244,112,57,153,124,58,133,35,184,180,122,252,2,54,91,37,85,151,49,45,93,250,152,227,138,146,174,5,223,41,16,103,108,186,201,211,0,230,207,225,158,168,44,99,22,1,63,88,226,137,169,13,56,52,27,171,51,255,176,187,72,12,95,185,177,205,46,197,243,219,71,229,165,156,119,10,166,32,104,254,127,193,173],i=[1,2,3,5],s=function(e,t){return e<<t&65535|(65535&e)>>16-t},o=function(e,t){return(65535&e)>>t|e<<16-t&65535};e.exports=a.rc2=a.rc2||{},a.rc2.expandKey=function(e,t){"string"==typeof e&&(e=a.util.createBuffer(e)),t=t||128;var r,i=e,s=e.length(),o=t,c=Math.ceil(o/8),u=255>>(7&o);for(r=s;r<128;r++)i.putByte(n[i.at(r-1)+i.at(r-s)&255]);for(i.setAt(128-c,n[i.at(128-c)&u]),r=127-c;r>=0;r--)i.setAt(r,n[i.at(r+1)^i.at(r+c)]);return i};var c=function(e,t,r){var n,c,u,l,p=!1,h=null,f=null,d=null,y=[];for(e=a.rc2.expandKey(e,t),u=0;u<64;u++)y.push(e.getInt16Le());r?(n=function(e){for(u=0;u<4;u++)e[u]+=y[l]+(e[(u+3)%4]&e[(u+2)%4])+(~e[(u+3)%4]&e[(u+1)%4]),e[u]=s(e[u],i[u]),l++},c=function(e){for(u=0;u<4;u++)e[u]+=y[63&e[(u+3)%4]]}):(n=function(e){for(u=3;u>=0;u--)e[u]=o(e[u],i[u]),e[u]-=y[l]+(e[(u+3)%4]&e[(u+2)%4])+(~e[(u+3)%4]&e[(u+1)%4]),l--},c=function(e){for(u=3;u>=0;u--)e[u]-=y[63&e[(u+3)%4]]});var g=function(e){var t=[];for(u=0;u<4;u++){var a=h.getInt16Le();null!==d&&(r?a^=d.getInt16Le():d.putInt16Le(a)),t.push(65535&a)}l=r?0:63;for(var n=0;n<e.length;n++)for(var i=0;i<e[n][0];i++)e[n][1](t);for(u=0;u<4;u++)null!==d&&(r?d.putInt16Le(t[u]):t[u]^=d.getInt16Le()),f.putInt16Le(t[u])},v=null;return v={start:function(e,t){e&&"string"==typeof e&&(e=a.util.createBuffer(e)),p=!1,h=a.util.createBuffer(),f=t||new a.util.createBuffer,d=e,v.output=f},update:function(e){for(p||h.putBuffer(e);h.length()>=8;)g([[5,n],[1,c],[6,n],[1,c],[5,n]])},finish:function(e){var t=!0;if(r)if(e)t=e(8,h,!r);else{var a=8===h.length()?8:8-h.length();h.fillWithByte(a,a)}if(t&&(p=!0,v.update()),!r&&(t=0===h.length()))if(e)t=e(8,f,!r);else{var n=f.length(),i=f.at(n-1);i>n?t=!1:f.truncate(i)}return t}}};a.rc2.startEncrypting=function(e,t,r){var n=a.rc2.createEncryptionCipher(e,128);return n.start(t,r),n},a.rc2.createEncryptionCipher=function(e,t){return c(e,t,!0)},a.rc2.startDecrypting=function(e,t,r){var n=a.rc2.createDecryptionCipher(e,128);return n.start(t,r),n},a.rc2.createDecryptionCipher=function(e,t){return c(e,t,!1)}},function(e,t,r){function a(){o=String.fromCharCode(128),o+=i.util.fillString(String.fromCharCode(0),64),u=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],c=!0}function n(e,t,r){for(var a,n,i,s,o,c,l,p,h,f,d,y,g,v,m,C=r.length();C>=64;){for(l=0;l<16;++l)t[l]=r.getInt32();for(;l<64;++l)a=t[l-2],a=(a>>>17|a<<15)^(a>>>19|a<<13)^a>>>10,n=t[l-15],n=(n>>>7|n<<25)^(n>>>18|n<<14)^n>>>3,t[l]=a+t[l-7]+n+t[l-16]|0;for(p=e.h0,h=e.h1,f=e.h2,d=e.h3,y=e.h4,g=e.h5,v=e.h6,m=e.h7,l=0;l<64;++l)s=(y>>>6|y<<26)^(y>>>11|y<<21)^(y>>>25|y<<7),o=v^y&(g^v),i=(p>>>2|p<<30)^(p>>>13|p<<19)^(p>>>22|p<<10),c=p&h|f&(p^h),a=m+s+o+u[l]+t[l],n=i+c,m=v,v=g,g=y,y=d+a>>>0,d=f,f=h,h=p,p=a+n>>>0;e.h0=e.h0+p|0,e.h1=e.h1+h|0,e.h2=e.h2+f|0,e.h3=e.h3+d|0,e.h4=e.h4+y|0,e.h5=e.h5+g|0,e.h6=e.h6+v|0,e.h7=e.h7+m|0,C-=64}}var i=r(0);r(4),r(1);var s=e.exports=i.sha256=i.sha256||{};i.md.sha256=i.md.algorithms.sha256=s,s.create=function(){c||a();var e=null,t=i.util.createBuffer(),r=new Array(64),s={algorithm:"sha256",blockLength:64,digestLength:32,messageLength:0,fullMessageLength:null,messageLengthSize:8};return s.start=function(){s.messageLength=0,s.fullMessageLength=s.messageLength64=[];for(var r=s.messageLengthSize/4,a=0;a<r;++a)s.fullMessageLength.push(0);return t=i.util.createBuffer(),e={h0:1779033703,h1:3144134277,h2:1013904242,h3:2773480762,h4:1359893119,h5:2600822924,h6:528734635,h7:1541459225},s},s.start(),s.update=function(a,o){"utf8"===o&&(a=i.util.encodeUtf8(a));var c=a.length;s.messageLength+=c,c=[c/4294967296>>>0,c>>>0];for(var u=s.fullMessageLength.length-1;u>=0;--u)s.fullMessageLength[u]+=c[1],c[1]=c[0]+(s.fullMessageLength[u]/4294967296>>>0),s.fullMessageLength[u]=s.fullMessageLength[u]>>>0,c[0]=c[1]/4294967296>>>0;return t.putBytes(a),n(e,r,t),(t.read>2048||0===t.length())&&t.compact(),s},s.digest=function(){var a=i.util.createBuffer();a.putBytes(t.bytes());var c=s.fullMessageLength[s.fullMessageLength.length-1]+s.messageLengthSize,u=c&s.blockLength-1;a.putBytes(o.substr(0,s.blockLength-u));for(var l,p,h=8*s.fullMessageLength[0],f=0;f<s.fullMessageLength.length-1;++f)l=8*s.fullMessageLength[f+1],p=l/4294967296>>>0,h+=p,a.putInt32(h>>>0),h=l>>>0;a.putInt32(h);var d={h0:e.h0,h1:e.h1,h2:e.h2,h3:e.h3,h4:e.h4,h5:e.h5,h6:e.h6,h7:e.h7};n(d,r,a);var y=i.util.createBuffer();return y.putInt32(d.h0),y.putInt32(d.h1),y.putInt32(d.h2),y.putInt32(d.h3),y.putInt32(d.h4),y.putInt32(d.h5),y.putInt32(d.h6),y.putInt32(d.h7),y},s};var o=null,c=!1,u=null},function(e,t,r){var a=r(0);r(3),r(8),r(14),r(7),r(26),r(2),r(9),r(1);var n=function(e,t,r,n){var i=a.util.createBuffer(),s=e.length>>1,o=s+(1&e.length),c=e.substr(0,o),u=e.substr(s,o),l=a.util.createBuffer(),p=a.hmac.create();r=t+r;var h=Math.ceil(n/16),f=Math.ceil(n/20);p.start("MD5",c);var d=a.util.createBuffer();l.putBytes(r);for(var y=0;y<h;++y)p.start(null,null),p.update(l.getBytes()),l.putBuffer(p.digest()),p.start(null,null),p.update(l.bytes()+r),d.putBuffer(p.digest());p.start("SHA1",u);var g=a.util.createBuffer();l.clear(),l.putBytes(r);for(var y=0;y<f;++y)p.start(null,null),p.update(l.getBytes()),l.putBuffer(p.digest()),p.start(null,null),p.update(l.bytes()+r),g.putBuffer(p.digest());return i.putBytes(a.util.xorBytes(d.getBytes(),g.getBytes(),n)),i},i=function(e,t,r){var n=a.hmac.create();n.start("SHA1",e);var i=a.util.createBuffer();return i.putInt32(t[0]),i.putInt32(t[1]),i.putByte(r.type),i.putByte(r.version.major),i.putByte(r.version.minor),i.putInt16(r.length),i.putBytes(r.fragment.bytes()),n.update(i.getBytes()),n.digest().getBytes()},s=function(e,t,r){var n=!1;try{var i=e.deflate(t.fragment.getBytes());t.fragment=a.util.createBuffer(i),t.length=i.length,n=!0}catch(e){}return n},o=function(e,t,r){var n=!1;try{var i=e.inflate(t.fragment.getBytes());t.fragment=a.util.createBuffer(i),t.length=i.length,n=!0}catch(e){}return n},c=function(e,t){var r=0;switch(t){case 1:r=e.getByte();break;case 2:r=e.getInt16();break;case 3:r=e.getInt24();break;case 4:r=e.getInt32()}return a.util.createBuffer(e.getBytes(r))},u=function(e,t,r){e.putInt(r.length(),t<<3),e.putBuffer(r)},l={};l.Versions={TLS_1_0:{major:3,minor:1},TLS_1_1:{major:3,minor:2},TLS_1_2:{major:3,minor:3}},l.SupportedVersions=[l.Versions.TLS_1_1,l.Versions.TLS_1_0],l.Version=l.SupportedVersions[0],l.MaxFragment=15360,l.ConnectionEnd={server:0,client:1},l.PRFAlgorithm={tls_prf_sha256:0},l.BulkCipherAlgorithm={none:null,rc4:0,des3:1,aes:2},l.CipherType={stream:0,block:1,aead:2},l.MACAlgorithm={none:null,hmac_md5:0,hmac_sha1:1,hmac_sha256:2,hmac_sha384:3,hmac_sha512:4},l.CompressionMethod={none:0,deflate:1},l.ContentType={change_cipher_spec:20,alert:21,handshake:22,application_data:23,heartbeat:24},l.HandshakeType={hello_request:0,client_hello:1,server_hello:2,certificate:11,server_key_exchange:12,certificate_request:13,server_hello_done:14,certificate_verify:15,client_key_exchange:16,finished:20},l.Alert={},l.Alert.Level={warning:1,fatal:2},l.Alert.Description={close_notify:0,unexpected_message:10,bad_record_mac:20,decryption_failed:21,record_overflow:22,decompression_failure:30,handshake_failure:40,bad_certificate:42,unsupported_certificate:43,certificate_revoked:44,certificate_expired:45,certificate_unknown:46,illegal_parameter:47,unknown_ca:48,access_denied:49,decode_error:50,decrypt_error:51,export_restriction:60,protocol_version:70,insufficient_security:71,internal_error:80,user_canceled:90,no_renegotiation:100},l.HeartbeatMessageType={heartbeat_request:1,heartbeat_response:2},l.CipherSuites={},l.getCipherSuite=function(e){var t=null;for(var r in l.CipherSuites){var a=l.CipherSuites[r];if(a.id[0]===e.charCodeAt(0)&&a.id[1]===e.charCodeAt(1)){t=a;break}}return t},l.handleUnexpected=function(e,t){var r=!e.open&&e.entity===l.ConnectionEnd.client;r||e.error(e,{message:"Unexpected message. Received TLS record out of order.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.unexpected_message}})},l.handleHelloRequest=function(e,t,r){!e.handshaking&&e.handshakes>0&&(l.queue(e,l.createAlert(e,{level:l.Alert.Level.warning,description:l.Alert.Description.no_renegotiation})),l.flush(e)),e.process()},l.parseHelloMessage=function(e,t,r){var n=null,i=e.entity===l.ConnectionEnd.client;if(r<38)e.error(e,{message:i?"Invalid ServerHello message. Message too short.":"Invalid ClientHello message. Message too short.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}});else{var s=t.fragment,o=s.length();if(n={version:{major:s.getByte(),minor:s.getByte()},random:a.util.createBuffer(s.getBytes(32)),session_id:c(s,1),extensions:[]},i?(n.cipher_suite=s.getBytes(2),n.compression_method=s.getByte()):(n.cipher_suites=c(s,2),n.compression_methods=c(s,1)),o=r-(o-s.length()),o>0){for(var u=c(s,2);u.length()>0;)n.extensions.push({type:[u.getByte(),u.getByte()],data:c(u,2)});if(!i)for(var p=0;p<n.extensions.length;++p){var h=n.extensions[p];if(0===h.type[0]&&0===h.type[1])for(var f=c(h.data,2);f.length()>0;){var d=f.getByte();if(0!==d)break;e.session.extensions.server_name.serverNameList.push(c(f,2).getBytes())}}}if(e.session.version&&(n.version.major!==e.session.version.major||n.version.minor!==e.session.version.minor))return e.error(e,{message:"TLS version change is disallowed during renegotiation.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.protocol_version}});if(i)e.session.cipherSuite=l.getCipherSuite(n.cipher_suite);else for(var y=a.util.createBuffer(n.cipher_suites.bytes());y.length()>0&&(e.session.cipherSuite=l.getCipherSuite(y.getBytes(2)),null===e.session.cipherSuite););if(null===e.session.cipherSuite)return e.error(e,{message:"No cipher suites in common.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.handshake_failure},cipherSuite:a.util.bytesToHex(n.cipher_suite)});i?e.session.compressionMethod=n.compression_method:e.session.compressionMethod=l.CompressionMethod.none}return n},l.createSecurityParameters=function(e,t){var r=e.entity===l.ConnectionEnd.client,a=t.random.bytes(),n=r?e.session.sp.client_random:a,i=r?a:l.createRandom().getBytes();e.session.sp={entity:e.entity,prf_algorithm:l.PRFAlgorithm.tls_prf_sha256,bulk_cipher_algorithm:null,cipher_type:null,enc_key_length:null,block_length:null,fixed_iv_length:null,record_iv_length:null,mac_algorithm:null,mac_length:null,mac_key_length:null,compression_algorithm:e.session.compressionMethod,pre_master_secret:null,master_secret:null,client_random:n,server_random:i}},l.handleServerHello=function(e,t,r){var a=l.parseHelloMessage(e,t,r);if(!e.fail){if(!(a.version.minor<=e.version.minor))return e.error(e,{message:"Incompatible TLS version.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.protocol_version}});e.version.minor=a.version.minor,e.session.version=e.version;var n=a.session_id.bytes();n.length>0&&n===e.session.id?(e.expect=g,e.session.resuming=!0,e.session.sp.server_random=a.random.bytes()):(e.expect=h,e.session.resuming=!1,l.createSecurityParameters(e,a)),e.session.id=n,e.process()}},l.handleClientHello=function(e,t,r){var n=l.parseHelloMessage(e,t,r);if(!e.fail){var i=n.session_id.bytes(),s=null;if(e.sessionCache&&(s=e.sessionCache.getSession(i),null===s?i="":(s.version.major!==n.version.major||s.version.minor>n.version.minor)&&(s=null,i="")),0===i.length&&(i=a.random.getBytes(32)),e.session.id=i,e.session.clientHelloVersion=n.version,e.session.sp={},s)e.version=e.session.version=s.version,e.session.sp=s.sp;else{for(var o,c=1;c<l.SupportedVersions.length&&(o=l.SupportedVersions[c],!(o.minor<=n.version.minor));++c);e.version={major:o.major,minor:o.minor},e.session.version=e.version}null!==s?(e.expect=A,e.session.resuming=!0,e.session.sp.client_random=n.random.bytes()):(e.expect=e.verifyClient!==!1?S:T,e.session.resuming=!1,l.createSecurityParameters(e,n)),e.open=!0,l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createServerHello(e)})),e.session.resuming?(l.queue(e,l.createRecord(e,{type:l.ContentType.change_cipher_spec,data:l.createChangeCipherSpec()})),e.state.pending=l.createConnectionState(e),e.state.current.write=e.state.pending.write,l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createFinished(e)}))):(l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createCertificate(e)})),e.fail||(l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createServerKeyExchange(e)})),e.verifyClient!==!1&&l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createCertificateRequest(e)})),l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createServerHelloDone(e)})))),l.flush(e),e.process()}},l.handleCertificate=function(e,t,r){if(r<3)return e.error(e,{message:"Invalid Certificate message. Message too short.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}});var n,i,s=t.fragment,o={certificate_list:c(s,3)},u=[];try{for(;o.certificate_list.length()>0;)n=c(o.certificate_list,3),i=a.asn1.fromDer(n),n=a.pki.certificateFromAsn1(i,!0),u.push(n)}catch(t){return e.error(e,{message:"Could not parse certificate list.",cause:t,send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.bad_certificate}})}var p=e.entity===l.ConnectionEnd.client;!p&&e.verifyClient!==!0||0!==u.length?0===u.length?e.expect=p?f:T:(p?e.session.serverCertificate=u[0]:e.session.clientCertificate=u[0],l.verifyCertificateChain(e,u)&&(e.expect=p?f:T)):e.error(e,{message:p?"No server certificate provided.":"No client certificate provided.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}}),e.process()},l.handleServerKeyExchange=function(e,t,r){return r>0?e.error(e,{message:"Invalid key parameters. Only RSA is supported.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.unsupported_certificate}}):(e.expect=d,void e.process())},l.handleClientKeyExchange=function(e,t,r){if(r<48)return e.error(e,{message:"Invalid key parameters. Only RSA is supported.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.unsupported_certificate}});var n=t.fragment,i={enc_pre_master_secret:c(n,2).getBytes()},s=null;if(e.getPrivateKey)try{s=e.getPrivateKey(e,e.session.serverCertificate),s=a.pki.privateKeyFromPem(s)}catch(t){e.error(e,{message:"Could not get private key.",cause:t,send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}})}if(null===s)return e.error(e,{message:"No private key set.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}});try{var o=e.session.sp;o.pre_master_secret=s.decrypt(i.enc_pre_master_secret);var u=e.session.clientHelloVersion;if(u.major!==o.pre_master_secret.charCodeAt(0)||u.minor!==o.pre_master_secret.charCodeAt(1))throw new Error("TLS version rollback attack detected.")}catch(e){o.pre_master_secret=a.random.getBytes(48)}e.expect=A,null!==e.session.clientCertificate&&(e.expect=I),e.process()},l.handleCertificateRequest=function(e,t,r){if(r<3)return e.error(e,{message:"Invalid CertificateRequest. Message too short.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}});var a=t.fragment,n={certificate_types:c(a,1),certificate_authorities:c(a,2)};e.session.certificateRequest=n,e.expect=y,e.process()},l.handleCertificateVerify=function(e,t,r){if(r<2)return e.error(e,{message:"Invalid CertificateVerify. Message too short.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}});var n=t.fragment;n.read-=4;var i=n.bytes();n.read+=4;var s={signature:c(n,2).getBytes()},o=a.util.createBuffer();o.putBuffer(e.session.md5.digest()),o.putBuffer(e.session.sha1.digest()),o=o.getBytes();try{var u=e.session.clientCertificate;if(!u.publicKey.verify(o,s.signature,"NONE"))throw new Error("CertificateVerify signature does not match.");e.session.md5.update(i),e.session.sha1.update(i)}catch(t){return e.error(e,{message:"Bad signature in CertificateVerify.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.handshake_failure}})}e.expect=A,e.process()},l.handleServerHelloDone=function(e,t,r){if(r>0)return e.error(e,{message:"Invalid ServerHelloDone message. Invalid length.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.record_overflow}});if(null===e.serverCertificate){var n={message:"No server certificate provided. Not enough security.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.insufficient_security}},i=0,s=e.verify(e,n.alert.description,i,[]);if(s!==!0)return(s||0===s)&&("object"!=typeof s||a.util.isArray(s)?"number"==typeof s&&(n.alert.description=s):(s.message&&(n.message=s.message),s.alert&&(n.alert.description=s.alert))),e.error(e,n)}null!==e.session.certificateRequest&&(t=l.createRecord(e,{type:l.ContentType.handshake,data:l.createCertificate(e)}),l.queue(e,t)),t=l.createRecord(e,{type:l.ContentType.handshake,data:l.createClientKeyExchange(e)}),l.queue(e,t),e.expect=C;var o=function(e,t){null!==e.session.certificateRequest&&null!==e.session.clientCertificate&&l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createCertificateVerify(e,t)})),l.queue(e,l.createRecord(e,{type:l.ContentType.change_cipher_spec,data:l.createChangeCipherSpec()})),e.state.pending=l.createConnectionState(e),e.state.current.write=e.state.pending.write,l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createFinished(e)})),e.expect=g,l.flush(e),e.process()};return null===e.session.certificateRequest||null===e.session.clientCertificate?o(e,null):void l.getClientSignature(e,o)},l.handleChangeCipherSpec=function(e,t){if(1!==t.fragment.getByte())return e.error(e,{message:"Invalid ChangeCipherSpec message received.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.illegal_parameter}});var r=e.entity===l.ConnectionEnd.client;(e.session.resuming&&r||!e.session.resuming&&!r)&&(e.state.pending=l.createConnectionState(e)),e.state.current.read=e.state.pending.read,(!e.session.resuming&&r||e.session.resuming&&!r)&&(e.state.pending=null),e.expect=r?v:b,e.process()},l.handleFinished=function(e,t,r){var i=t.fragment;i.read-=4;var s=i.bytes();i.read+=4;var o=t.fragment.getBytes();i=a.util.createBuffer(),i.putBuffer(e.session.md5.digest()),i.putBuffer(e.session.sha1.digest());var c=e.entity===l.ConnectionEnd.client,u=c?"server finished":"client finished",p=e.session.sp,h=12,f=n;return i=f(p.master_secret,u,i.getBytes(),h),i.getBytes()!==o?e.error(e,{message:"Invalid verify_data in Finished message.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.decrypt_error}}):(e.session.md5.update(s),e.session.sha1.update(s),(e.session.resuming&&c||!e.session.resuming&&!c)&&(l.queue(e,l.createRecord(e,{type:l.ContentType.change_cipher_spec,data:l.createChangeCipherSpec()})),e.state.current.write=e.state.pending.write,e.state.pending=null,l.queue(e,l.createRecord(e,{type:l.ContentType.handshake,data:l.createFinished(e)}))),e.expect=c?m:B,e.handshaking=!1,++e.handshakes,e.peerCertificate=c?e.session.serverCertificate:e.session.clientCertificate,l.flush(e),e.isConnected=!0,e.connected(e),void e.process())},l.handleAlert=function(e,t){var r,a=t.fragment,n={level:a.getByte(),description:a.getByte()};switch(n.description){case l.Alert.Description.close_notify:r="Connection closed.";break;case l.Alert.Description.unexpected_message:r="Unexpected message.";break;case l.Alert.Description.bad_record_mac:r="Bad record MAC.";break;case l.Alert.Description.decryption_failed:r="Decryption failed.";break;case l.Alert.Description.record_overflow:r="Record overflow.";break;case l.Alert.Description.decompression_failure:r="Decompression failed.";break;case l.Alert.Description.handshake_failure:r="Handshake failure.";break;case l.Alert.Description.bad_certificate:r="Bad certificate.";break;case l.Alert.Description.unsupported_certificate:r="Unsupported certificate.";break;case l.Alert.Description.certificate_revoked:r="Certificate revoked.";break;case l.Alert.Description.certificate_expired:r="Certificate expired.";break;case l.Alert.Description.certificate_unknown:r="Certificate unknown.";break;case l.Alert.Description.illegal_parameter:r="Illegal parameter.";break;case l.Alert.Description.unknown_ca:r="Unknown certificate authority.";break;case l.Alert.Description.access_denied:r="Access denied.";break;case l.Alert.Description.decode_error:r="Decode error.";break;case l.Alert.Description.decrypt_error:r="Decrypt error.";break;case l.Alert.Description.export_restriction:r="Export restriction.";break;case l.Alert.Description.protocol_version:r="Unsupported protocol version.";break;case l.Alert.Description.insufficient_security:r="Insufficient security.";break;case l.Alert.Description.internal_error:r="Internal error.";break;case l.Alert.Description.user_canceled:r="User canceled.";break;case l.Alert.Description.no_renegotiation:r="Renegotiation not supported.";break;default:r="Unknown error."}return n.description===l.Alert.Description.close_notify?e.close():(e.error(e,{message:r,send:!1,origin:e.entity===l.ConnectionEnd.client?"server":"client",alert:n}),void e.process())},l.handleHandshake=function(e,t){var r=t.fragment,n=r.getByte(),i=r.getInt24();if(i>r.length())return e.fragmented=t,t.fragment=a.util.createBuffer(),r.read-=4,e.process();e.fragmented=null,r.read-=4;var s=r.bytes(i+4);r.read+=4,n in F[e.entity][e.expect]?(e.entity!==l.ConnectionEnd.server||e.open||e.fail||(e.handshaking=!0,e.session={version:null,extensions:{server_name:{serverNameList:[]}},cipherSuite:null,compressionMethod:null,serverCertificate:null,clientCertificate:null,md5:a.md.md5.create(),sha1:a.md.sha1.create()}),n!==l.HandshakeType.hello_request&&n!==l.HandshakeType.certificate_verify&&n!==l.HandshakeType.finished&&(e.session.md5.update(s),e.session.sha1.update(s)),F[e.entity][e.expect][n](e,t,i)):l.handleUnexpected(e,t)},l.handleApplicationData=function(e,t){e.data.putBuffer(t.fragment),e.dataReady(e),e.process()},l.handleHeartbeat=function(e,t){var r=t.fragment,n=r.getByte(),i=r.getInt16(),s=r.getBytes(i);if(n===l.HeartbeatMessageType.heartbeat_request){if(e.handshaking||i>s.length)return e.process();l.queue(e,l.createRecord(e,{type:l.ContentType.heartbeat,data:l.createHeartbeat(l.HeartbeatMessageType.heartbeat_response,s)})),l.flush(e)}else if(n===l.HeartbeatMessageType.heartbeat_response){if(s!==e.expectedHeartbeatPayload)return e.process();e.heartbeatReceived&&e.heartbeatReceived(e,a.util.createBuffer(s))}e.process()};var p=0,h=1,f=2,d=3,y=4,g=5,v=6,m=7,C=8,E=0,S=1,T=2,I=3,A=4,b=5,B=6,N=l.handleUnexpected,k=l.handleChangeCipherSpec,R=l.handleAlert,w=l.handleHandshake,L=l.handleApplicationData,_=l.handleHeartbeat,U=[];U[l.ConnectionEnd.client]=[[N,R,w,N,_],[N,R,w,N,_],[N,R,w,N,_],[N,R,w,N,_],[N,R,w,N,_],[k,R,N,N,_],[N,R,w,N,_],[N,R,w,L,_],[N,R,w,N,_]],U[l.ConnectionEnd.server]=[[N,R,w,N,_],[N,R,w,N,_],[N,R,w,N,_],[N,R,w,N,_],[k,R,N,N,_],[N,R,w,N,_],[N,R,w,L,_],[N,R,w,N,_]];var D=l.handleHelloRequest,P=l.handleServerHello,V=l.handleCertificate,O=l.handleServerKeyExchange,x=l.handleCertificateRequest,K=l.handleServerHelloDone,M=l.handleFinished,F=[];F[l.ConnectionEnd.client]=[[N,N,P,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,V,O,x,K,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,O,x,K,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,N,x,K,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,N,N,K,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,M],[D,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[D,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N]];var q=l.handleClientHello,j=l.handleClientKeyExchange,H=l.handleCertificateVerify;F[l.ConnectionEnd.server]=[[N,q,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,V,N,N,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,j,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,H,N,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,M],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N],[N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N,N]],l.generateKeys=function(e,t){var r=n,a=t.client_random+t.server_random;e.session.resuming||(t.master_secret=r(t.pre_master_secret,"master secret",a,48).bytes(),t.pre_master_secret=null),a=t.server_random+t.client_random;var i=2*t.mac_key_length+2*t.enc_key_length,s=e.version.major===l.Versions.TLS_1_0.major&&e.version.minor===l.Versions.TLS_1_0.minor;s&&(i+=2*t.fixed_iv_length);var o=r(t.master_secret,"key expansion",a,i),c={client_write_MAC_key:o.getBytes(t.mac_key_length),server_write_MAC_key:o.getBytes(t.mac_key_length),client_write_key:o.getBytes(t.enc_key_length),server_write_key:o.getBytes(t.enc_key_length)};return s&&(c.client_write_IV=o.getBytes(t.fixed_iv_length),c.server_write_IV=o.getBytes(t.fixed_iv_length)),c},l.createConnectionState=function(e){var t=e.entity===l.ConnectionEnd.client,r=function(){var e={sequenceNumber:[0,0],macKey:null,macLength:0,macFunction:null,cipherState:null,cipherFunction:function(e){return!0},compressionState:null,compressFunction:function(e){return!0},updateSequenceNumber:function(){
4294967295===e.sequenceNumber[1]?(e.sequenceNumber[1]=0,++e.sequenceNumber[0]):++e.sequenceNumber[1]}};return e},a={read:r(),write:r()};if(a.read.update=function(e,t){return a.read.cipherFunction(t,a.read)?a.read.compressFunction(e,t,a.read)||e.error(e,{message:"Could not decompress record.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.decompression_failure}}):e.error(e,{message:"Could not decrypt record or bad MAC.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.bad_record_mac}}),!e.fail},a.write.update=function(e,t){return a.write.compressFunction(e,t,a.write)?a.write.cipherFunction(t,a.write)||e.error(e,{message:"Could not encrypt record.",send:!1,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}}):e.error(e,{message:"Could not compress record.",send:!1,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}}),!e.fail},e.session){var n=e.session.sp;switch(e.session.cipherSuite.initSecurityParameters(n),n.keys=l.generateKeys(e,n),a.read.macKey=t?n.keys.server_write_MAC_key:n.keys.client_write_MAC_key,a.write.macKey=t?n.keys.client_write_MAC_key:n.keys.server_write_MAC_key,e.session.cipherSuite.initConnectionState(a,e,n),n.compression_algorithm){case l.CompressionMethod.none:break;case l.CompressionMethod.deflate:a.read.compressFunction=o,a.write.compressFunction=s;break;default:throw new Error("Unsupported compression algorithm.")}}return a},l.createRandom=function(){var e=new Date,t=+e+6e4*e.getTimezoneOffset(),r=a.util.createBuffer();return r.putInt32(t),r.putBytes(a.random.getBytes(28)),r},l.createRecord=function(e,t){if(!t.data)return null;var r={type:t.type,version:{major:e.version.major,minor:e.version.minor},length:t.data.length(),fragment:t.data};return r},l.createAlert=function(e,t){var r=a.util.createBuffer();return r.putByte(t.level),r.putByte(t.description),l.createRecord(e,{type:l.ContentType.alert,data:r})},l.createClientHello=function(e){e.session.clientHelloVersion={major:e.version.major,minor:e.version.minor};for(var t=a.util.createBuffer(),r=0;r<e.cipherSuites.length;++r){var n=e.cipherSuites[r];t.putByte(n.id[0]),t.putByte(n.id[1])}var i=t.length(),s=a.util.createBuffer();s.putByte(l.CompressionMethod.none);var o=s.length(),c=a.util.createBuffer();if(e.virtualHost){var p=a.util.createBuffer();p.putByte(0),p.putByte(0);var h=a.util.createBuffer();h.putByte(0),u(h,2,a.util.createBuffer(e.virtualHost));var f=a.util.createBuffer();u(f,2,h),u(p,2,f),c.putBuffer(p)}var d=c.length();d>0&&(d+=2);var y=e.session.id,g=y.length+1+2+4+28+2+i+1+o+d,v=a.util.createBuffer();return v.putByte(l.HandshakeType.client_hello),v.putInt24(g),v.putByte(e.version.major),v.putByte(e.version.minor),v.putBytes(e.session.sp.client_random),u(v,1,a.util.createBuffer(y)),u(v,2,t),u(v,1,s),d>0&&u(v,2,c),v},l.createServerHello=function(e){var t=e.session.id,r=t.length+1+2+4+28+2+1,n=a.util.createBuffer();return n.putByte(l.HandshakeType.server_hello),n.putInt24(r),n.putByte(e.version.major),n.putByte(e.version.minor),n.putBytes(e.session.sp.server_random),u(n,1,a.util.createBuffer(t)),n.putByte(e.session.cipherSuite.id[0]),n.putByte(e.session.cipherSuite.id[1]),n.putByte(e.session.compressionMethod),n},l.createCertificate=function(e){var t=e.entity===l.ConnectionEnd.client,r=null;if(e.getCertificate){var n;n=t?e.session.certificateRequest:e.session.extensions.server_name.serverNameList,r=e.getCertificate(e,n)}var i=a.util.createBuffer();if(null!==r)try{a.util.isArray(r)||(r=[r]);for(var s=null,o=0;o<r.length;++o){var c=a.pem.decode(r[o])[0];if("CERTIFICATE"!==c.type&&"X509 CERTIFICATE"!==c.type&&"TRUSTED CERTIFICATE"!==c.type){var p=new Error('Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".');throw p.headerType=c.type,p}if(c.procType&&"ENCRYPTED"===c.procType.type)throw new Error("Could not convert certificate from PEM; PEM is encrypted.");var h=a.util.createBuffer(c.body);null===s&&(s=a.asn1.fromDer(h.bytes(),!1));var f=a.util.createBuffer();u(f,3,h),i.putBuffer(f)}r=a.pki.certificateFromAsn1(s),t?e.session.clientCertificate=r:e.session.serverCertificate=r}catch(t){return e.error(e,{message:"Could not send certificate list.",cause:t,send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.bad_certificate}})}var d=3+i.length(),y=a.util.createBuffer();return y.putByte(l.HandshakeType.certificate),y.putInt24(d),u(y,3,i),y},l.createClientKeyExchange=function(e){var t=a.util.createBuffer();t.putByte(e.session.clientHelloVersion.major),t.putByte(e.session.clientHelloVersion.minor),t.putBytes(a.random.getBytes(46));var r=e.session.sp;r.pre_master_secret=t.getBytes();var n=e.session.serverCertificate.publicKey;t=n.encrypt(r.pre_master_secret);var i=t.length+2,s=a.util.createBuffer();return s.putByte(l.HandshakeType.client_key_exchange),s.putInt24(i),s.putInt16(t.length),s.putBytes(t),s},l.createServerKeyExchange=function(e){var t=0,r=a.util.createBuffer();return t>0&&(r.putByte(l.HandshakeType.server_key_exchange),r.putInt24(t)),r},l.getClientSignature=function(e,t){var r=a.util.createBuffer();r.putBuffer(e.session.md5.digest()),r.putBuffer(e.session.sha1.digest()),r=r.getBytes(),e.getSignature=e.getSignature||function(e,t,r){var n=null;if(e.getPrivateKey)try{n=e.getPrivateKey(e,e.session.clientCertificate),n=a.pki.privateKeyFromPem(n)}catch(t){e.error(e,{message:"Could not get private key.",cause:t,send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}})}null===n?e.error(e,{message:"No private key set.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.internal_error}}):t=n.sign(t,null),r(e,t)},e.getSignature(e,r,t)},l.createCertificateVerify=function(e,t){var r=t.length+2,n=a.util.createBuffer();return n.putByte(l.HandshakeType.certificate_verify),n.putInt24(r),n.putInt16(t.length),n.putBytes(t),n},l.createCertificateRequest=function(e){var t=a.util.createBuffer();t.putByte(1);var r=a.util.createBuffer();for(var n in e.caStore.certs){var i=e.caStore.certs[n],s=a.pki.distinguishedNameToAsn1(i.subject),o=a.asn1.toDer(s);r.putInt16(o.length()),r.putBuffer(o)}var c=1+t.length()+2+r.length(),p=a.util.createBuffer();return p.putByte(l.HandshakeType.certificate_request),p.putInt24(c),u(p,1,t),u(p,2,r),p},l.createServerHelloDone=function(e){var t=a.util.createBuffer();return t.putByte(l.HandshakeType.server_hello_done),t.putInt24(0),t},l.createChangeCipherSpec=function(){var e=a.util.createBuffer();return e.putByte(1),e},l.createFinished=function(e){var t=a.util.createBuffer();t.putBuffer(e.session.md5.digest()),t.putBuffer(e.session.sha1.digest());var r=e.entity===l.ConnectionEnd.client,i=e.session.sp,s=12,o=n,c=r?"client finished":"server finished";t=o(i.master_secret,c,t.getBytes(),s);var u=a.util.createBuffer();return u.putByte(l.HandshakeType.finished),u.putInt24(t.length()),u.putBuffer(t),u},l.createHeartbeat=function(e,t,r){"undefined"==typeof r&&(r=t.length);var n=a.util.createBuffer();n.putByte(e),n.putInt16(r),n.putBytes(t);var i=n.length(),s=Math.max(16,i-r-3);return n.putBytes(a.random.getBytes(s)),n},l.queue=function(e,t){if(t&&(0!==t.fragment.length()||t.type!==l.ContentType.handshake&&t.type!==l.ContentType.alert&&t.type!==l.ContentType.change_cipher_spec)){if(t.type===l.ContentType.handshake){var r=t.fragment.bytes();e.session.md5.update(r),e.session.sha1.update(r),r=null}var n;if(t.fragment.length()<=l.MaxFragment)n=[t];else{n=[];for(var i=t.fragment.bytes();i.length>l.MaxFragment;)n.push(l.createRecord(e,{type:t.type,data:a.util.createBuffer(i.slice(0,l.MaxFragment))})),i=i.slice(l.MaxFragment);i.length>0&&n.push(l.createRecord(e,{type:t.type,data:a.util.createBuffer(i)}))}for(var s=0;s<n.length&&!e.fail;++s){var o=n[s],c=e.state.current.write;c.update(e,o)&&e.records.push(o)}}},l.flush=function(e){for(var t=0;t<e.records.length;++t){var r=e.records[t];e.tlsData.putByte(r.type),e.tlsData.putByte(r.version.major),e.tlsData.putByte(r.version.minor),e.tlsData.putInt16(r.fragment.length()),e.tlsData.putBuffer(e.records[t].fragment)}return e.records=[],e.tlsDataReady(e)};var G=function(e){switch(e){case!0:return!0;case a.pki.certificateError.bad_certificate:return l.Alert.Description.bad_certificate;case a.pki.certificateError.unsupported_certificate:return l.Alert.Description.unsupported_certificate;case a.pki.certificateError.certificate_revoked:return l.Alert.Description.certificate_revoked;case a.pki.certificateError.certificate_expired:return l.Alert.Description.certificate_expired;case a.pki.certificateError.certificate_unknown:return l.Alert.Description.certificate_unknown;case a.pki.certificateError.unknown_ca:return l.Alert.Description.unknown_ca;default:return l.Alert.Description.bad_certificate}},Q=function(e){switch(e){case!0:return!0;case l.Alert.Description.bad_certificate:return a.pki.certificateError.bad_certificate;case l.Alert.Description.unsupported_certificate:return a.pki.certificateError.unsupported_certificate;case l.Alert.Description.certificate_revoked:return a.pki.certificateError.certificate_revoked;case l.Alert.Description.certificate_expired:return a.pki.certificateError.certificate_expired;case l.Alert.Description.certificate_unknown:return a.pki.certificateError.certificate_unknown;case l.Alert.Description.unknown_ca:return a.pki.certificateError.unknown_ca;default:return a.pki.certificateError.bad_certificate}};l.verifyCertificateChain=function(e,t){try{a.pki.verifyCertificateChain(e.caStore,t,function(t,r,n){var i=(G(t),e.verify(e,t,r,n));if(i!==!0){if("object"==typeof i&&!a.util.isArray(i)){var s=new Error("The application rejected the certificate.");throw s.send=!0,s.alert={level:l.Alert.Level.fatal,description:l.Alert.Description.bad_certificate},i.message&&(s.message=i.message),i.alert&&(s.alert.description=i.alert),s}i!==t&&(i=Q(i))}return i})}catch(t){var r=t;("object"!=typeof r||a.util.isArray(r))&&(r={send:!0,alert:{level:l.Alert.Level.fatal,description:G(t)}}),"send"in r||(r.send=!0),"alert"in r||(r.alert={level:l.Alert.Level.fatal,description:G(r.error)}),e.error(e,r)}return!e.fail},l.createSessionCache=function(e,t){var r=null;if(e&&e.getSession&&e.setSession&&e.order)r=e;else{r={},r.cache=e||{},r.capacity=Math.max(t||100,1),r.order=[];for(var n in e)r.order.length<=t?r.order.push(n):delete e[n];r.getSession=function(e){var t=null,n=null;if(e?n=a.util.bytesToHex(e):r.order.length>0&&(n=r.order[0]),null!==n&&n in r.cache){t=r.cache[n],delete r.cache[n];for(var i in r.order)if(r.order[i]===n){r.order.splice(i,1);break}}return t},r.setSession=function(e,t){if(r.order.length===r.capacity){var n=r.order.shift();delete r.cache[n]}var n=a.util.bytesToHex(e);r.order.push(n),r.cache[n]=t}}return r},l.createConnection=function(e){var t=null;t=e.caStore?a.util.isArray(e.caStore)?a.pki.createCaStore(e.caStore):e.caStore:a.pki.createCaStore();var r=e.cipherSuites||null;if(null===r){r=[];for(var n in l.CipherSuites)r.push(l.CipherSuites[n])}var i=e.server?l.ConnectionEnd.server:l.ConnectionEnd.client,s=e.sessionCache?l.createSessionCache(e.sessionCache):null,o={version:{major:l.Version.major,minor:l.Version.minor},entity:i,sessionId:e.sessionId,caStore:t,sessionCache:s,cipherSuites:r,connected:e.connected,virtualHost:e.virtualHost||null,verifyClient:e.verifyClient||!1,verify:e.verify||function(e,t,r,a){return t},getCertificate:e.getCertificate||null,getPrivateKey:e.getPrivateKey||null,getSignature:e.getSignature||null,input:a.util.createBuffer(),tlsData:a.util.createBuffer(),data:a.util.createBuffer(),tlsDataReady:e.tlsDataReady,dataReady:e.dataReady,heartbeatReceived:e.heartbeatReceived,closed:e.closed,error:function(t,r){r.origin=r.origin||(t.entity===l.ConnectionEnd.client?"client":"server"),r.send&&(l.queue(t,l.createAlert(t,r.alert)),l.flush(t));var a=r.fatal!==!1;a&&(t.fail=!0),e.error(t,r),a&&t.close(!1)},deflate:e.deflate||null,inflate:e.inflate||null};o.reset=function(e){o.version={major:l.Version.major,minor:l.Version.minor},o.record=null,o.session=null,o.peerCertificate=null,o.state={pending:null,current:null},o.expect=o.entity===l.ConnectionEnd.client?p:E,o.fragmented=null,o.records=[],o.open=!1,o.handshakes=0,o.handshaking=!1,o.isConnected=!1,o.fail=!(e||"undefined"==typeof e),o.input.clear(),o.tlsData.clear(),o.data.clear(),o.state.current=l.createConnectionState(o)},o.reset();var c=function(e,t){var r=t.type-l.ContentType.change_cipher_spec,a=U[e.entity][e.expect];r in a?a[r](e,t):l.handleUnexpected(e,t)},u=function(e){var t=0,r=e.input,n=r.length();if(n<5)t=5-n;else{e.record={type:r.getByte(),version:{major:r.getByte(),minor:r.getByte()},length:r.getInt16(),fragment:a.util.createBuffer(),ready:!1};var i=e.record.version.major===e.version.major;i&&e.session&&e.session.version&&(i=e.record.version.minor===e.version.minor),i||e.error(e,{message:"Incompatible TLS version.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.protocol_version}})}return t},h=function(e){var t=0,r=e.input,a=r.length();if(a<e.record.length)t=e.record.length-a;else{e.record.fragment.putBytes(r.getBytes(e.record.length)),r.compact();var n=e.state.current.read;n.update(e,e.record)&&(null!==e.fragmented&&(e.fragmented.type===e.record.type?(e.fragmented.fragment.putBuffer(e.record.fragment),e.record=e.fragmented):e.error(e,{message:"Invalid fragmented record.",send:!0,alert:{level:l.Alert.Level.fatal,description:l.Alert.Description.unexpected_message}})),e.record.ready=!0)}return t};return o.handshake=function(e){if(o.entity!==l.ConnectionEnd.client)o.error(o,{message:"Cannot initiate handshake as a server.",fatal:!1});else if(o.handshaking)o.error(o,{message:"Handshake already in progress.",fatal:!1});else{o.fail&&!o.open&&0===o.handshakes&&(o.fail=!1),o.handshaking=!0,e=e||"";var t=null;e.length>0&&(o.sessionCache&&(t=o.sessionCache.getSession(e)),null===t&&(e="")),0===e.length&&o.sessionCache&&(t=o.sessionCache.getSession(),null!==t&&(e=t.id)),o.session={id:e,version:null,cipherSuite:null,compressionMethod:null,serverCertificate:null,certificateRequest:null,clientCertificate:null,sp:{},md5:a.md.md5.create(),sha1:a.md.sha1.create()},t&&(o.version=t.version,o.session.sp=t.sp),o.session.sp.client_random=l.createRandom().getBytes(),o.open=!0,l.queue(o,l.createRecord(o,{type:l.ContentType.handshake,data:l.createClientHello(o)})),l.flush(o)}},o.process=function(e){var t=0;return e&&o.input.putBytes(e),o.fail||(null!==o.record&&o.record.ready&&o.record.fragment.isEmpty()&&(o.record=null),null===o.record&&(t=u(o)),o.fail||null===o.record||o.record.ready||(t=h(o)),!o.fail&&null!==o.record&&o.record.ready&&c(o,o.record)),t},o.prepare=function(e){return l.queue(o,l.createRecord(o,{type:l.ContentType.application_data,data:a.util.createBuffer(e)})),l.flush(o)},o.prepareHeartbeatRequest=function(e,t){return e instanceof a.util.ByteBuffer&&(e=e.bytes()),"undefined"==typeof t&&(t=e.length),o.expectedHeartbeatPayload=e,l.queue(o,l.createRecord(o,{type:l.ContentType.heartbeat,data:l.createHeartbeat(l.HeartbeatMessageType.heartbeat_request,e,t)})),l.flush(o)},o.close=function(e){if(!o.fail&&o.sessionCache&&o.session){var t={id:o.session.id,version:o.session.version,sp:o.session.sp};t.sp.keys=null,o.sessionCache.setSession(t.id,t)}o.open&&(o.open=!1,o.input.clear(),(o.isConnected||o.handshaking)&&(o.isConnected=o.handshaking=!1,l.queue(o,l.createAlert(o,{level:l.Alert.Level.warning,description:l.Alert.Description.close_notify})),l.flush(o)),o.closed(o)),o.reset(e)},o},e.exports=a.tls=a.tls||{};for(var z in l)"function"!=typeof l[z]&&(a.tls[z]=l[z]);a.tls.prf_tls1=n,a.tls.hmac_sha1=i,a.tls.createSessionCache=l.createSessionCache,a.tls.createConnection=l.createConnection},function(e,t){},function(e,t,r){e.exports=r(0),r(5),r(34),r(3),r(12),r(19),r(10),r(8),r(35),r(20),r(36),r(21),r(15),r(7),r(23),r(24),r(38),r(26),r(27),r(28),r(16),r(2),r(29),r(40),r(41),r(31),r(1)},function(e,t,r){function a(e,t,r){var a=t.entity===u.tls.ConnectionEnd.client;e.read.cipherState={init:!1,cipher:u.cipher.createDecipher("AES-CBC",a?r.keys.server_write_key:r.keys.client_write_key),iv:a?r.keys.server_write_IV:r.keys.client_write_IV},e.write.cipherState={init:!1,cipher:u.cipher.createCipher("AES-CBC",a?r.keys.client_write_key:r.keys.server_write_key),iv:a?r.keys.client_write_IV:r.keys.server_write_IV},e.read.cipherFunction=o,e.write.cipherFunction=n,e.read.macLength=e.write.macLength=r.mac_length,e.read.macFunction=e.write.macFunction=l.hmac_sha1}function n(e,t){var r=!1,a=t.macFunction(t.macKey,t.sequenceNumber,e);e.fragment.putBytes(a),t.updateSequenceNumber();var n;n=e.version.minor===l.Versions.TLS_1_0.minor?t.cipherState.init?null:t.cipherState.iv:u.random.getBytesSync(16),t.cipherState.init=!0;var s=t.cipherState.cipher;return s.start({iv:n}),e.version.minor>=l.Versions.TLS_1_1.minor&&s.output.putBytes(n),s.update(e.fragment),s.finish(i)&&(e.fragment=s.output,e.length=e.fragment.length(),r=!0),r}function i(e,t,r){if(!r){var a=e-t.length()%e;t.fillWithByte(a-1,a)}return!0}function s(e,t,r){var a=!0;if(r){for(var n=t.length(),i=t.last(),s=n-1-i;s<n-1;++s)a=a&&t.at(s)==i;a&&t.truncate(i+1)}return a}function o(e,t){var r=!1;++p;var a;a=e.version.minor===l.Versions.TLS_1_0.minor?t.cipherState.init?null:t.cipherState.iv:e.fragment.getBytes(16),t.cipherState.init=!0;var n=t.cipherState.cipher;n.start({iv:a}),n.update(e.fragment),r=n.finish(s);var i=t.macLength,o=u.random.getBytesSync(i),h=n.output.length();h>=i?(e.fragment=n.output.getBytes(h-i),o=n.output.getBytes(i)):e.fragment=n.output.getBytes(),e.fragment=u.util.createBuffer(e.fragment),e.length=e.fragment.length();var f=t.macFunction(t.macKey,t.sequenceNumber,e);return t.updateSequenceNumber(),r=c(t.macKey,o,f)&&r}function c(e,t,r){var a=u.hmac.create();return a.start("SHA1",e),a.update(t),t=a.digest().getBytes(),a.start(null,null),a.update(r),r=a.digest().getBytes(),t===r}var u=r(0);r(5),r(31);var l=e.exports=u.tls;l.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA={id:[0,47],name:"TLS_RSA_WITH_AES_128_CBC_SHA",initSecurityParameters:function(e){e.bulk_cipher_algorithm=l.BulkCipherAlgorithm.aes,e.cipher_type=l.CipherType.block,e.enc_key_length=16,e.block_length=16,e.fixed_iv_length=16,e.record_iv_length=16,e.mac_algorithm=l.MACAlgorithm.hmac_sha1,e.mac_length=20,e.mac_key_length=20},initConnectionState:a},l.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA={id:[0,53],name:"TLS_RSA_WITH_AES_256_CBC_SHA",initSecurityParameters:function(e){e.bulk_cipher_algorithm=l.BulkCipherAlgorithm.aes,e.cipher_type=l.CipherType.block,e.enc_key_length=32,e.block_length=16,e.fixed_iv_length=16,e.record_iv_length=16,e.mac_algorithm=l.MACAlgorithm.hmac_sha1,e.mac_length=20,e.mac_key_length=20},initConnectionState:a};var p=0},function(e,t,r){function a(e,t,r,a){e.generate=function(e,i){for(var s=new n.util.ByteBuffer,o=Math.ceil(i/a)+r,c=new n.util.ByteBuffer,u=r;u<o;++u){c.putInt32(u),t.start(),t.update(e+c.getBytes());var l=t.digest();s.putBytes(l.getBytes(a))}return s.truncate(s.length()-i),s.getBytes()}}var n=r(0);r(1),r(2),r(13),e.exports=n.kem=n.kem||{};var i=n.jsbn.BigInteger;n.kem.rsa={},n.kem.rsa.create=function(e,t){t=t||{};var r=t.prng||n.random,a={};return a.encrypt=function(t,a){var s,o=Math.ceil(t.n.bitLength()/8);do s=new i(n.util.bytesToHex(r.getBytesSync(o)),16).mod(t.n);while(s.equals(i.ZERO));s=n.util.hexToBytes(s.toString(16));var c=o-s.length;c>0&&(s=n.util.fillString(String.fromCharCode(0),c)+s);var u=t.encrypt(s,"NONE"),l=e.generate(s,a);return{encapsulation:u,key:l}},a.decrypt=function(t,r,a){var n=t.decrypt(r,"NONE");return e.generate(n,a)},a},n.kem.kdf1=function(e,t){a(this,e,0,t||e.digestLength)},n.kem.kdf2=function(e,t){a(this,e,1,t||e.digestLength)}},function(e,t,r){e.exports=r(4),r(14),r(9),r(30),r(39)},function(e,t,r){var a=r(0);r(21),e.exports=a.mgf=a.mgf||{},a.mgf.mgf1=a.mgf1},function(e,t,r){function a(e){var t={},r=[];if(!d.validate(e,y.asn1.recipientInfoValidator,t,r)){var a=new Error("Cannot read PKCS#7 RecipientInfo. ASN.1 object is not an PKCS#7 RecipientInfo.");throw a.errors=r,a}return{version:t.version.charCodeAt(0),issuer:f.pki.RDNAttributesAsArray(t.issuer),serialNumber:f.util.createBuffer(t.serial).toHex(),encryptedContent:{algorithm:d.derToOid(t.encAlgorithm),parameter:t.encParameter.value,content:t.encKey}}}function n(e){return d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,d.integerToDer(e.version).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[f.pki.distinguishedNameToAsn1({attributes:e.issuer}),d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,f.util.hexToBytes(e.serialNumber))]),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.encryptedContent.algorithm).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.NULL,!1,"")]),d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,e.encryptedContent.content)])}function i(e){for(var t=[],r=0;r<e.length;++r)t.push(a(e[r]));return t}function s(e){for(var t=[],r=0;r<e.length;++r)t.push(n(e[r]));return t}function o(e){var t=d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,d.integerToDer(e.version).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[f.pki.distinguishedNameToAsn1({attributes:e.issuer}),d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,f.util.hexToBytes(e.serialNumber))]),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.digestAlgorithm).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.NULL,!1,"")])]);if(e.authenticatedAttributesAsn1&&t.value.push(e.authenticatedAttributesAsn1),t.value.push(d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.signatureAlgorithm).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.NULL,!1,"")])),t.value.push(d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,e.signature)),e.unauthenticatedAttributes.length>0){for(var r=d.create(d.Class.CONTEXT_SPECIFIC,1,!0,[]),a=0;a<e.unauthenticatedAttributes.length;++a){var n=e.unauthenticatedAttributes[a];r.values.push(u(n))}t.value.push(r)}return t}function c(e){for(var t=[],r=0;r<e.length;++r)t.push(o(e[r]));return t}function u(e){var t;if(e.type===f.pki.oids.contentType)t=d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.value).getBytes());else if(e.type===f.pki.oids.messageDigest)t=d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,e.value.bytes());else if(e.type===f.pki.oids.signingTime){var r=new Date("1950-01-01T00:00:00Z"),a=new Date("2050-01-01T00:00:00Z"),n=e.value;if("string"==typeof n){var i=Date.parse(n);n=isNaN(i)?13===n.length?d.utcTimeToDate(n):d.generalizedTimeToDate(n):new Date(i)}t=n>=r&&n<a?d.create(d.Class.UNIVERSAL,d.Type.UTCTIME,!1,d.dateToUtcTime(n)):d.create(d.Class.UNIVERSAL,d.Type.GENERALIZEDTIME,!1,d.dateToGeneralizedTime(n))}return d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.type).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SET,!0,[t])])}function l(e){return[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(f.pki.oids.data).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.algorithm).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,e.parameter.getBytes())]),d.create(d.Class.CONTEXT_SPECIFIC,0,!0,[d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,e.content.getBytes())])]}function p(e,t,r){var a={},n=[];if(!d.validate(t,r,a,n)){var i=new Error("Cannot read PKCS#7 message. ASN.1 object is not a supported PKCS#7 message.");throw i.errors=i,i}var s=d.derToOid(a.contentType);if(s!==f.pki.oids.data)throw new Error("Unsupported PKCS#7 message. Only wrapped ContentType Data supported.");if(a.encryptedContent){var o="";if(f.util.isArray(a.encryptedContent))for(var c=0;c<a.encryptedContent.length;++c){if(a.encryptedContent[c].type!==d.Type.OCTETSTRING)throw new Error("Malformed PKCS#7 message, expecting encrypted content constructed of only OCTET STRING objects.");o+=a.encryptedContent[c].value}else o=a.encryptedContent;e.encryptedContent={algorithm:d.derToOid(a.encAlgorithm),parameter:f.util.createBuffer(a.encParameter.value),content:f.util.createBuffer(o)}}if(a.content){var o="";if(f.util.isArray(a.content))for(var c=0;c<a.content.length;++c){if(a.content[c].type!==d.Type.OCTETSTRING)throw new Error("Malformed PKCS#7 message, expecting content constructed of only OCTET STRING objects.");o+=a.content[c].value}else o=a.content;e.content=f.util.createBuffer(o)}return e.version=a.version.charCodeAt(0),e.rawCapture=a,a}function h(e){if(void 0===e.encryptedContent.key)throw new Error("Symmetric key not available.");if(void 0===e.content){var t;switch(e.encryptedContent.algorithm){case f.pki.oids["aes128-CBC"]:case f.pki.oids["aes192-CBC"]:case f.pki.oids["aes256-CBC"]:t=f.aes.createDecryptionCipher(e.encryptedContent.key);break;case f.pki.oids.desCBC:case f.pki.oids["des-EDE3-CBC"]:t=f.des.createDecryptionCipher(e.encryptedContent.key);break;default:throw new Error("Unsupported symmetric cipher, OID "+e.encryptedContent.algorithm)}if(t.start(e.encryptedContent.parameter),t.update(e.encryptedContent.content),!t.finish())throw new Error("Symmetric decryption failed.");e.content=t.output}}var f=r(0);r(5),r(3),r(10),r(6),r(7),r(25),r(2),r(1),r(17);var d=f.asn1,y=e.exports=f.pkcs7=f.pkcs7||{};y.messageFromPem=function(e){var t=f.pem.decode(e)[0];if("PKCS7"!==t.type){var r=new Error('Could not convert PKCS#7 message from PEM; PEM header type is not "PKCS#7".');throw r.headerType=t.type,r}if(t.procType&&"ENCRYPTED"===t.procType.type)throw new Error("Could not convert PKCS#7 message from PEM; PEM is encrypted.");var a=d.fromDer(t.body);return y.messageFromAsn1(a)},y.messageToPem=function(e,t){var r={type:"PKCS7",body:d.toDer(e.toAsn1()).getBytes()};return f.pem.encode(r,{maxline:t})},y.messageFromAsn1=function(e){var t={},r=[];if(!d.validate(e,y.asn1.contentInfoValidator,t,r)){var a=new Error("Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 ContentInfo.");throw a.errors=r,a}var n,i=d.derToOid(t.contentType);switch(i){case f.pki.oids.envelopedData:n=y.createEnvelopedData();break;case f.pki.oids.encryptedData:n=y.createEncryptedData();break;case f.pki.oids.signedData:n=y.createSignedData();break;default:throw new Error("Cannot read PKCS#7 message. ContentType with OID "+i+" is not (yet) supported.")}return n.fromAsn1(t.content.value[0]),n},y.createSignedData=function(){function e(){for(var e={},t=0;t<r.signers.length;++t){var a=r.signers[t],n=a.digestAlgorithm;n in e||(e[n]=f.md[f.pki.oids[n]].create()),0===a.authenticatedAttributes.length?a.md=e[n]:a.md=f.md[f.pki.oids[n]].create()}r.digestAlgorithmIdentifiers=[];for(var n in e)r.digestAlgorithmIdentifiers.push(d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(n).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.NULL,!1,"")]));return e}function t(e){if(r.contentInfo.value.length<2)throw new Error("Could not sign PKCS#7 message; there is no content to sign.");var t=d.derToOid(r.contentInfo.value[0].value),a=r.contentInfo.value[1];a=a.value[0];var n=d.toDer(a);n.getByte(),d.getBerValueLength(n),n=n.getBytes();for(var i in e)e[i].start().update(n);for(var s=new Date,o=0;o<r.signers.length;++o){var l=r.signers[o];if(0===l.authenticatedAttributes.length){if(t!==f.pki.oids.data)throw new Error("Invalid signer; authenticatedAttributes must be present when the ContentInfo content type is not PKCS#7 Data.")}else{l.authenticatedAttributesAsn1=d.create(d.Class.CONTEXT_SPECIFIC,0,!0,[]);for(var p=d.create(d.Class.UNIVERSAL,d.Type.SET,!0,[]),h=0;h<l.authenticatedAttributes.length;++h){var y=l.authenticatedAttributes[h];y.type===f.pki.oids.messageDigest?y.value=e[l.digestAlgorithm].digest():y.type===f.pki.oids.signingTime&&(y.value||(y.value=s)),p.value.push(u(y)),l.authenticatedAttributesAsn1.value.push(u(y))}n=d.toDer(p).getBytes(),l.md.start().update(n)}l.signature=l.key.sign(l.md,"RSASSA-PKCS1-V1_5")}r.signerInfos=c(r.signers)}var r=null;return r={type:f.pki.oids.signedData,version:1,certificates:[],crls:[],signers:[],digestAlgorithmIdentifiers:[],contentInfo:null,signerInfos:[],fromAsn1:function(e){p(r,e,y.asn1.signedDataValidator),r.certificates=[],r.crls=[],r.digestAlgorithmIdentifiers=[],r.contentInfo=null,r.signerInfos=[];for(var t=r.rawCapture.certificates.value,a=0;a<t.length;++a)r.certificates.push(f.pki.certificateFromAsn1(t[a]))},toAsn1:function(){r.contentInfo||r.sign();for(var e=[],t=0;t<r.certificates.length;++t)e.push(f.pki.certificateToAsn1(r.certificates[t]));var a=[],n=d.create(d.Class.CONTEXT_SPECIFIC,0,!0,[d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,d.integerToDer(r.version).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SET,!0,r.digestAlgorithmIdentifiers),r.contentInfo])]);return e.length>0&&n.value[0].value.push(d.create(d.Class.CONTEXT_SPECIFIC,0,!0,e)),a.length>0&&n.value[0].value.push(d.create(d.Class.CONTEXT_SPECIFIC,1,!0,a)),n.value[0].value.push(d.create(d.Class.UNIVERSAL,d.Type.SET,!0,r.signerInfos)),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(r.type).getBytes()),n])},addSigner:function(e){var t=e.issuer,a=e.serialNumber;if(e.certificate){var n=e.certificate;"string"==typeof n&&(n=f.pki.certificateFromPem(n)),t=n.issuer.attributes,a=n.serialNumber}var i=e.key;if(!i)throw new Error("Could not add PKCS#7 signer; no private key specified.");"string"==typeof i&&(i=f.pki.privateKeyFromPem(i));var s=e.digestAlgorithm||f.pki.oids.sha1;switch(s){case f.pki.oids.sha1:case f.pki.oids.sha256:case f.pki.oids.sha384:case f.pki.oids.sha512:case f.pki.oids.md5:break;default:throw new Error("Could not add PKCS#7 signer; unknown message digest algorithm: "+s)}var o=e.authenticatedAttributes||[];if(o.length>0){for(var c=!1,u=!1,l=0;l<o.length;++l){var p=o[l];if(c||p.type!==f.pki.oids.contentType){if(u||p.type!==f.pki.oids.messageDigest);else if(u=!0,c)break}else if(c=!0,u)break}if(!c||!u)throw new Error("Invalid signer.authenticatedAttributes. If signer.authenticatedAttributes is specified, then it must contain at least two attributes, PKCS #9 content-type and PKCS #9 message-digest.")}r.signers.push({key:i,version:1,issuer:t,serialNumber:a,digestAlgorithm:s,signatureAlgorithm:f.pki.oids.rsaEncryption,signature:null,authenticatedAttributes:o,unauthenticatedAttributes:[]})},sign:function(){if(("object"!=typeof r.content||null===r.contentInfo)&&(r.contentInfo=d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(f.pki.oids.data).getBytes())]),"content"in r)){var a;r.content instanceof f.util.ByteBuffer?a=r.content.bytes():"string"==typeof r.content&&(a=f.util.encodeUtf8(r.content)),r.contentInfo.value.push(d.create(d.Class.CONTEXT_SPECIFIC,0,!0,[d.create(d.Class.UNIVERSAL,d.Type.OCTETSTRING,!1,a)]))}if(0!==r.signers.length){var n=e();t(n)}},verify:function(){throw new Error("PKCS#7 signature verification not yet implemented.")},addCertificate:function(e){"string"==typeof e&&(e=f.pki.certificateFromPem(e)),r.certificates.push(e)},addCertificateRevokationList:function(e){throw new Error("PKCS#7 CRL support not yet implemented.")}}},y.createEncryptedData=function(){var e=null;return e={type:f.pki.oids.encryptedData,version:0,encryptedContent:{algorithm:f.pki.oids["aes256-CBC"]},fromAsn1:function(t){p(e,t,y.asn1.encryptedDataValidator)},decrypt:function(t){void 0!==t&&(e.encryptedContent.key=t),h(e)}}},y.createEnvelopedData=function(){var e=null;return e={type:f.pki.oids.envelopedData,version:0,recipients:[],encryptedContent:{algorithm:f.pki.oids["aes256-CBC"]},fromAsn1:function(t){var r=p(e,t,y.asn1.envelopedDataValidator);e.recipients=i(r.recipientInfos.value)},toAsn1:function(){return d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.OID,!1,d.oidToDer(e.type).getBytes()),d.create(d.Class.CONTEXT_SPECIFIC,0,!0,[d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,[d.create(d.Class.UNIVERSAL,d.Type.INTEGER,!1,d.integerToDer(e.version).getBytes()),d.create(d.Class.UNIVERSAL,d.Type.SET,!0,s(e.recipients)),d.create(d.Class.UNIVERSAL,d.Type.SEQUENCE,!0,l(e.encryptedContent))])])]);
},findRecipient:function(t){for(var r=t.issuer.attributes,a=0;a<e.recipients.length;++a){var n=e.recipients[a],i=n.issuer;if(n.serialNumber===t.serialNumber&&i.length===r.length){for(var s=!0,o=0;o<r.length;++o)if(i[o].type!==r[o].type||i[o].value!==r[o].value){s=!1;break}if(s)return n}}return null},decrypt:function(t,r){if(void 0===e.encryptedContent.key&&void 0!==t&&void 0!==r)switch(t.encryptedContent.algorithm){case f.pki.oids.rsaEncryption:case f.pki.oids.desCBC:var a=r.decrypt(t.encryptedContent.content);e.encryptedContent.key=f.util.createBuffer(a);break;default:throw new Error("Unsupported asymmetric cipher, OID "+t.encryptedContent.algorithm)}h(e)},addRecipient:function(t){e.recipients.push({version:0,issuer:t.issuer.attributes,serialNumber:t.serialNumber,encryptedContent:{algorithm:f.pki.oids.rsaEncryption,key:t.publicKey}})},encrypt:function(t,r){if(void 0===e.encryptedContent.content){r=r||e.encryptedContent.algorithm,t=t||e.encryptedContent.key;var a,n,i;switch(r){case f.pki.oids["aes128-CBC"]:a=16,n=16,i=f.aes.createEncryptionCipher;break;case f.pki.oids["aes192-CBC"]:a=24,n=16,i=f.aes.createEncryptionCipher;break;case f.pki.oids["aes256-CBC"]:a=32,n=16,i=f.aes.createEncryptionCipher;break;case f.pki.oids["des-EDE3-CBC"]:a=24,n=8,i=f.des.createEncryptionCipher;break;default:throw new Error("Unsupported symmetric cipher, OID "+r)}if(void 0===t)t=f.util.createBuffer(f.random.getBytes(a));else if(t.length()!=a)throw new Error("Symmetric key has wrong length; got "+t.length()+" bytes, expected "+a+".");e.encryptedContent.algorithm=r,e.encryptedContent.key=t,e.encryptedContent.parameter=f.util.createBuffer(f.random.getBytes(n));var s=i(t);if(s.start(e.encryptedContent.parameter.copy()),s.update(e.content),!s.finish())throw new Error("Symmetric encryption failed.");e.encryptedContent.content=s.output}for(var o=0;o<e.recipients.length;++o){var c=e.recipients[o];if(void 0===c.encryptedContent.content)switch(c.encryptedContent.algorithm){case f.pki.oids.rsaEncryption:c.encryptedContent.content=c.encryptedContent.key.encrypt(e.encryptedContent.key.data);break;default:throw new Error("Unsupported asymmetric cipher, OID "+c.encryptedContent.algorithm)}}}}}},function(e,t,r){function a(){c=String.fromCharCode(128),c+=i.util.fillString(String.fromCharCode(0),128),l=[[1116352408,3609767458],[1899447441,602891725],[3049323471,3964484399],[3921009573,2173295548],[961987163,4081628472],[1508970993,3053834265],[2453635748,2937671579],[2870763221,3664609560],[3624381080,2734883394],[310598401,1164996542],[607225278,1323610764],[1426881987,3590304994],[1925078388,4068182383],[2162078206,991336113],[2614888103,633803317],[3248222580,3479774868],[3835390401,2666613458],[4022224774,944711139],[264347078,2341262773],[604807628,2007800933],[770255983,1495990901],[1249150122,1856431235],[1555081692,3175218132],[1996064986,2198950837],[2554220882,3999719339],[2821834349,766784016],[2952996808,2566594879],[3210313671,3203337956],[3336571891,1034457026],[3584528711,2466948901],[113926993,3758326383],[338241895,168717936],[666307205,1188179964],[773529912,1546045734],[1294757372,1522805485],[1396182291,2643833823],[1695183700,2343527390],[1986661051,1014477480],[2177026350,1206759142],[2456956037,344077627],[2730485921,1290863460],[2820302411,3158454273],[3259730800,3505952657],[3345764771,106217008],[3516065817,3606008344],[3600352804,1432725776],[4094571909,1467031594],[275423344,851169720],[430227734,3100823752],[506948616,1363258195],[659060556,3750685593],[883997877,3785050280],[958139571,3318307427],[1322822218,3812723403],[1537002063,2003034995],[1747873779,3602036899],[1955562222,1575990012],[2024104815,1125592928],[2227730452,2716904306],[2361852424,442776044],[2428436474,593698344],[2756734187,3733110249],[3204031479,2999351573],[3329325298,3815920427],[3391569614,3928383900],[3515267271,566280711],[3940187606,3454069534],[4118630271,4000239992],[116418474,1914138554],[174292421,2731055270],[289380356,3203993006],[460393269,320620315],[685471733,587496836],[852142971,1086792851],[1017036298,365543100],[1126000580,2618297676],[1288033470,3409855158],[1501505948,4234509866],[1607167915,987167468],[1816402316,1246189591]],p={},p["SHA-512"]=[[1779033703,4089235720],[3144134277,2227873595],[1013904242,4271175723],[2773480762,1595750129],[1359893119,2917565137],[2600822924,725511199],[528734635,4215389547],[1541459225,327033209]],p["SHA-384"]=[[3418070365,3238371032],[1654270250,914150663],[2438529370,812702999],[355462360,4144912697],[1731405415,4290775857],[2394180231,1750603025],[3675008525,1694076839],[1203062813,3204075428]],p["SHA-512/256"]=[[573645204,4230739756],[2673172387,3360449730],[596883563,1867755857],[2520282905,1497426621],[2519219938,2827943907],[3193839141,1401305490],[721525244,746961066],[246885852,2177182882]],p["SHA-512/224"]=[[2352822216,424955298],[1944164710,2312950998],[502970286,855612546],[1738396948,1479516111],[258812777,2077511080],[2011393907,79989058],[1067287976,1780299464],[286451373,2446758561]],u=!0}function n(e,t,r){for(var a,n,i,s,o,c,u,p,h,f,d,y,g,v,m,C,E,S,T,I,A,b,B,N,k,R,w,L,_,U,D,P,V,O,x,K=r.length();K>=128;){for(_=0;_<16;++_)t[_][0]=r.getInt32()>>>0,t[_][1]=r.getInt32()>>>0;for(;_<80;++_)P=t[_-2],U=P[0],D=P[1],a=((U>>>19|D<<13)^(D>>>29|U<<3)^U>>>6)>>>0,n=((U<<13|D>>>19)^(D<<3|U>>>29)^(U<<26|D>>>6))>>>0,O=t[_-15],U=O[0],D=O[1],i=((U>>>1|D<<31)^(U>>>8|D<<24)^U>>>7)>>>0,s=((U<<31|D>>>1)^(U<<24|D>>>8)^(U<<25|D>>>7))>>>0,V=t[_-7],x=t[_-16],D=n+V[1]+s+x[1],t[_][0]=a+V[0]+i+x[0]+(D/4294967296>>>0)>>>0,t[_][1]=D>>>0;for(g=e[0][0],v=e[0][1],m=e[1][0],C=e[1][1],E=e[2][0],S=e[2][1],T=e[3][0],I=e[3][1],A=e[4][0],b=e[4][1],B=e[5][0],N=e[5][1],k=e[6][0],R=e[6][1],w=e[7][0],L=e[7][1],_=0;_<80;++_)u=((A>>>14|b<<18)^(A>>>18|b<<14)^(b>>>9|A<<23))>>>0,p=((A<<18|b>>>14)^(A<<14|b>>>18)^(b<<23|A>>>9))>>>0,h=(k^A&(B^k))>>>0,f=(R^b&(N^R))>>>0,o=((g>>>28|v<<4)^(v>>>2|g<<30)^(v>>>7|g<<25))>>>0,c=((g<<4|v>>>28)^(v<<30|g>>>2)^(v<<25|g>>>7))>>>0,d=(g&m|E&(g^m))>>>0,y=(v&C|S&(v^C))>>>0,D=L+p+f+l[_][1]+t[_][1],a=w+u+h+l[_][0]+t[_][0]+(D/4294967296>>>0)>>>0,n=D>>>0,D=c+y,i=o+d+(D/4294967296>>>0)>>>0,s=D>>>0,w=k,L=R,k=B,R=N,B=A,N=b,D=I+n,A=T+a+(D/4294967296>>>0)>>>0,b=D>>>0,T=E,I=S,E=m,S=C,m=g,C=v,D=n+s,g=a+i+(D/4294967296>>>0)>>>0,v=D>>>0;D=e[0][1]+v,e[0][0]=e[0][0]+g+(D/4294967296>>>0)>>>0,e[0][1]=D>>>0,D=e[1][1]+C,e[1][0]=e[1][0]+m+(D/4294967296>>>0)>>>0,e[1][1]=D>>>0,D=e[2][1]+S,e[2][0]=e[2][0]+E+(D/4294967296>>>0)>>>0,e[2][1]=D>>>0,D=e[3][1]+I,e[3][0]=e[3][0]+T+(D/4294967296>>>0)>>>0,e[3][1]=D>>>0,D=e[4][1]+b,e[4][0]=e[4][0]+A+(D/4294967296>>>0)>>>0,e[4][1]=D>>>0,D=e[5][1]+N,e[5][0]=e[5][0]+B+(D/4294967296>>>0)>>>0,e[5][1]=D>>>0,D=e[6][1]+R,e[6][0]=e[6][0]+k+(D/4294967296>>>0)>>>0,e[6][1]=D>>>0,D=e[7][1]+L,e[7][0]=e[7][0]+w+(D/4294967296>>>0)>>>0,e[7][1]=D>>>0,K-=128}}var i=r(0);r(4),r(1);var s=e.exports=i.sha512=i.sha512||{};i.md.sha512=i.md.algorithms.sha512=s;var o=i.sha384=i.sha512.sha384=i.sha512.sha384||{};o.create=function(){return s.create("SHA-384")},i.md.sha384=i.md.algorithms.sha384=o,i.sha512.sha256=i.sha512.sha256||{create:function(){return s.create("SHA-512/256")}},i.md["sha512/256"]=i.md.algorithms["sha512/256"]=i.sha512.sha256,i.sha512.sha224=i.sha512.sha224||{create:function(){return s.create("SHA-512/224")}},i.md["sha512/224"]=i.md.algorithms["sha512/224"]=i.sha512.sha224,s.create=function(e){if(u||a(),"undefined"==typeof e&&(e="SHA-512"),!(e in p))throw new Error("Invalid SHA-512 algorithm: "+e);for(var t=p[e],r=null,s=i.util.createBuffer(),o=new Array(80),l=0;l<80;++l)o[l]=new Array(2);var h={algorithm:e.replace("-","").toLowerCase(),blockLength:128,digestLength:64,messageLength:0,fullMessageLength:null,messageLengthSize:16};return h.start=function(){h.messageLength=0,h.fullMessageLength=h.messageLength128=[];for(var e=h.messageLengthSize/4,a=0;a<e;++a)h.fullMessageLength.push(0);s=i.util.createBuffer(),r=new Array(t.length);for(var a=0;a<t.length;++a)r[a]=t[a].slice(0);return h},h.start(),h.update=function(e,t){"utf8"===t&&(e=i.util.encodeUtf8(e));var a=e.length;h.messageLength+=a,a=[a/4294967296>>>0,a>>>0];for(var c=h.fullMessageLength.length-1;c>=0;--c)h.fullMessageLength[c]+=a[1],a[1]=a[0]+(h.fullMessageLength[c]/4294967296>>>0),h.fullMessageLength[c]=h.fullMessageLength[c]>>>0,a[0]=a[1]/4294967296>>>0;return s.putBytes(e),n(r,o,s),(s.read>2048||0===s.length())&&s.compact(),h},h.digest=function(){var t=i.util.createBuffer();t.putBytes(s.bytes());var a=h.fullMessageLength[h.fullMessageLength.length-1]+h.messageLengthSize,u=a&h.blockLength-1;t.putBytes(c.substr(0,h.blockLength-u));for(var l,p,f=8*h.fullMessageLength[0],d=0;d<h.fullMessageLength.length-1;++d)l=8*h.fullMessageLength[d+1],p=l/4294967296>>>0,f+=p,t.putInt32(f>>>0),f=l>>>0;t.putInt32(f);for(var y=new Array(r.length),d=0;d<r.length;++d)y[d]=r[d].slice(0);n(y,o,t);var g,v=i.util.createBuffer();g="SHA-512"===e?y.length:"SHA-384"===e?y.length-2:y.length-4;for(var d=0;d<g;++d)v.putInt32(y[d][0]),d===g-1&&"SHA-512/224"===e||v.putInt32(y[d][1]);return v},h};var c=null,u=!1,l=null,p=null},function(e,t,r){function a(e,t){var r=t.toString(16);r[0]>="8"&&(r="00"+r);var a=s.util.hexToBytes(r);e.putInt32(a.length),e.putBytes(a)}function n(e,t){e.putInt32(t.length),e.putString(t)}function i(){for(var e=s.md.sha1.create(),t=arguments.length,r=0;r<t;++r)e.update(arguments[r]);return e.digest()}var s=r(0);r(5),r(8),r(14),r(9),r(1);var o=e.exports=s.ssh=s.ssh||{};o.privateKeyToPutty=function(e,t,r){r=r||"",t=t||"";var o="ssh-rsa",c=""===t?"none":"aes256-cbc",u="PuTTY-User-Key-File-2: "+o+"\r\n";u+="Encryption: "+c+"\r\n",u+="Comment: "+r+"\r\n";var l=s.util.createBuffer();n(l,o),a(l,e.e),a(l,e.n);var p=s.util.encode64(l.bytes(),64),h=Math.floor(p.length/66)+1;u+="Public-Lines: "+h+"\r\n",u+=p;var f=s.util.createBuffer();a(f,e.d),a(f,e.p),a(f,e.q),a(f,e.qInv);var d;if(t){var y=f.length()+16-1;y-=y%16;var g=i(f.bytes());g.truncate(g.length()-y+f.length()),f.putBuffer(g);var v=s.util.createBuffer();v.putBuffer(i("\0\0\0\0",t)),v.putBuffer(i("\0\0\0",t));var m=s.aes.createEncryptionCipher(v.truncate(8),"CBC");m.start(s.util.createBuffer().fillWithByte(0,16)),m.update(f.copy()),m.finish();var C=m.output;C.truncate(16),d=s.util.encode64(C.bytes(),64)}else d=s.util.encode64(f.bytes(),64);h=Math.floor(d.length/66)+1,u+="\r\nPrivate-Lines: "+h+"\r\n",u+=d;var E=i("putty-private-key-file-mac-key",t),S=s.util.createBuffer();n(S,o),n(S,c),n(S,r),S.putInt32(l.length()),S.putBuffer(l),S.putInt32(f.length()),S.putBuffer(f);var T=s.hmac.create();return T.start("sha1",E),T.update(S.bytes()),u+="\r\nPrivate-MAC: "+T.digest().toHex()+"\r\n"},o.publicKeyToOpenSSH=function(e,t){var r="ssh-rsa";t=t||"";var i=s.util.createBuffer();return n(i,r),a(i,e.e),a(i,e.n),r+" "+s.util.encode64(i.bytes())+" "+t},o.privateKeyToOpenSSH=function(e,t){return t?s.pki.encryptRsaPrivateKey(e,t,{legacy:!0,algorithm:"aes128"}):s.pki.privateKeyToPem(e)},o.getPublicKeyFingerprint=function(e,t){t=t||{};var r=t.md||s.md.md5.create(),i="ssh-rsa",o=s.util.createBuffer();n(o,i),a(o,e.e),a(o,e.n),r.start(),r.update(o.getBytes());var c=r.digest();if("hex"===t.encoding){var u=c.toHex();return t.delimiter?u.match(/.{2}/g).join(t.delimiter):u}if("binary"===t.encoding)return c.getBytes();if(t.encoding)throw new Error('Unknown encoding "'+t.encoding+'".');return c}},function(e,t,r){var a=r(0);r(19),r(20),r(1);var n="forge.task",i=0,s={},o=0;a.debug.set(n,"tasks",s);var c={};a.debug.set(n,"queues",c);var u="?",l=30,p=20,h="ready",f="running",d="blocked",y="sleeping",g="done",v="error",m="stop",C="start",E="block",S="unblock",T="sleep",I="wakeup",A="cancel",b="fail",B={};B[h]={},B[h][m]=h,B[h][C]=f,B[h][A]=g,B[h][b]=v,B[f]={},B[f][m]=h,B[f][C]=f,B[f][E]=d,B[f][S]=f,B[f][T]=y,B[f][I]=f,B[f][A]=g,B[f][b]=v,B[d]={},B[d][m]=d,B[d][C]=d,B[d][E]=d,B[d][S]=d,B[d][T]=d,B[d][I]=d,B[d][A]=g,B[d][b]=v,B[y]={},B[y][m]=y,B[y][C]=y,B[y][E]=y,B[y][S]=y,B[y][T]=y,B[y][I]=y,B[y][A]=g,B[y][b]=v,B[g]={},B[g][m]=g,B[g][C]=g,B[g][E]=g,B[g][S]=g,B[g][T]=g,B[g][I]=g,B[g][A]=g,B[g][b]=v,B[v]={},B[v][m]=v,B[v][C]=v,B[v][E]=v,B[v][S]=v,B[v][T]=v,B[v][I]=v,B[v][A]=v,B[v][b]=v;var N=function(e){this.id=-1,this.name=e.name||u,this.parent=e.parent||null,this.run=e.run,this.subtasks=[],this.error=!1,this.state=h,this.blocks=0,this.timeoutId=null,this.swapTime=null,this.userData=null,this.id=o++,s[this.id]=this,i>=1&&a.log.verbose(n,"[%s][%s] init",this.id,this.name,this)};N.prototype.debug=function(e){e=e||"",a.log.debug(n,e,"[%s][%s] task:",this.id,this.name,this,"subtasks:",this.subtasks.length,"queue:",c)},N.prototype.next=function(e,t){"function"==typeof e&&(t=e,e=this.name);var r=new N({run:t,name:e,parent:this});return r.state=f,r.type=this.type,r.successCallback=this.successCallback||null,r.failureCallback=this.failureCallback||null,this.subtasks.push(r),this},N.prototype.parallel=function(e,t){return a.util.isArray(e)&&(t=e,e=this.name),this.next(e,function(r){var n=r;n.block(t.length);for(var i=function(e,r){a.task.start({type:e,run:function(e){t[r](e)},success:function(e){n.unblock()},failure:function(e){n.unblock()}})},s=0;s<t.length;s++){var o=e+"__parallel-"+r.id+"-"+s,c=s;i(o,c)}})},N.prototype.stop=function(){this.state=B[this.state][m]},N.prototype.start=function(){this.error=!1,this.state=B[this.state][C],this.state===f&&(this.start=new Date,this.run(this),R(this,0))},N.prototype.block=function(e){e="undefined"==typeof e?1:e,this.blocks+=e,this.blocks>0&&(this.state=B[this.state][E])},N.prototype.unblock=function(e){return e="undefined"==typeof e?1:e,this.blocks-=e,0===this.blocks&&this.state!==g&&(this.state=f,R(this,0)),this.blocks},N.prototype.sleep=function(e){e="undefined"==typeof e?0:e,this.state=B[this.state][T];var t=this;this.timeoutId=setTimeout(function(){t.timeoutId=null,t.state=f,R(t,0)},e)},N.prototype.wait=function(e){e.wait(this)},N.prototype.wakeup=function(){this.state===y&&(cancelTimeout(this.timeoutId),this.timeoutId=null,this.state=f,R(this,0))},N.prototype.cancel=function(){this.state=B[this.state][A],this.permitsNeeded=0,null!==this.timeoutId&&(cancelTimeout(this.timeoutId),this.timeoutId=null),this.subtasks=[]},N.prototype.fail=function(e){if(this.error=!0,w(this,!0),e)e.error=this.error,e.swapTime=this.swapTime,e.userData=this.userData,R(e,0);else{if(null!==this.parent){for(var t=this.parent;null!==t.parent;)t.error=this.error,t.swapTime=this.swapTime,t.userData=this.userData,t=t.parent;w(t,!0)}this.failureCallback&&this.failureCallback(this)}};var k=function(e){e.error=!1,e.state=B[e.state][C],setTimeout(function(){e.state===f&&(e.swapTime=+new Date,e.run(e),R(e,0))},0)},R=function(e,t){var r=t>l||+new Date-e.swapTime>p,a=function(t){if(t++,e.state===f)if(r&&(e.swapTime=+new Date),e.subtasks.length>0){var a=e.subtasks.shift();a.error=e.error,a.swapTime=e.swapTime,a.userData=e.userData,a.run(a),a.error||R(a,t)}else w(e),e.error||null!==e.parent&&(e.parent.error=e.error,e.parent.swapTime=e.swapTime,e.parent.userData=e.userData,R(e.parent,t))};r?setTimeout(a,0):a(t)},w=function(e,t){e.state=g,delete s[e.id],i>=1&&a.log.verbose(n,"[%s][%s] finish",e.id,e.name,e),null===e.parent&&(e.type in c?0===c[e.type].length?a.log.error(n,"[%s][%s] task queue empty [%s]",e.id,e.name,e.type):c[e.type][0]!==e?a.log.error(n,"[%s][%s] task not first in queue [%s]",e.id,e.name,e.type):(c[e.type].shift(),0===c[e.type].length?(i>=1&&a.log.verbose(n,"[%s][%s] delete queue [%s]",e.id,e.name,e.type),delete c[e.type]):(i>=1&&a.log.verbose(n,"[%s][%s] queue start next [%s] remain:%s",e.id,e.name,e.type,c[e.type].length),c[e.type][0].start())):a.log.error(n,"[%s][%s] task queue missing [%s]",e.id,e.name,e.type),t||(e.error&&e.failureCallback?e.failureCallback(e):!e.error&&e.successCallback&&e.successCallback(e)))};e.exports=a.task=a.task||{},a.task.start=function(e){var t=new N({run:e.run,name:e.name||u});t.type=e.type,t.successCallback=e.success||null,t.failureCallback=e.failure||null,t.type in c?c[e.type].push(t):(i>=1&&a.log.verbose(n,"[%s][%s] create queue [%s]",t.id,t.name,t.type),c[t.type]=[t],k(t))},a.task.cancel=function(e){e in c&&(c[e]=[c[e][0]])},a.task.createCondition=function(){var e={tasks:{}};return e.wait=function(t){t.id in e.tasks||(t.block(),e.tasks[t.id]=t)},e.notify=function(){var t=e.tasks;e.tasks={};for(var r in t)t[r].unblock()},e}},function(e,t,r){e.exports=r(33)}])});
//# sourceMappingURL=forge.min.js.map

//var W3CWebSocket = require('websocket').w3cwebsocket;

var client = new WebSocket('ws://192.168.1.149:8080', 'echo-protocol');



client.onerror = function() {
    console.log('Connection Error');
};




client.onopen = function() {
    console.log('WebSocket Client Connected');

    console.log(client.readyState);
    console.log(client.OPEN);
    function sendNumber() {
        if (client.readyState === client.OPEN) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            client.send(number.toString());
            setTimeout(sendNumber, 19000); //
        }
    }

    sendNumber();
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};


console.log('admin.js loaded');


//function add_row(key, row) {  //key = "so_table1"
//    var x=document.getElementById(key);
//    x.insertAdjacentHTML('beforeend',row);
//}

function insert_adjancent_html(key,position,row) {
    var x=document.getElementById(key);
    x.insertAdjacentHTML(position,row);
}


function _parse_int_pair_int(x) {
    var integer = parseInt(x,10);
    
    if (isNaN(integer)) {
	return [0,0];
    } else {
        return [1,o];
    }
}

function _get_fst_pair_int(x) {
    return x[0];
}

function _get_snd_pair_int(x) {
    return x[1];
}


function update_qty(key, value) {
  //document.getElementById("so2_qty").innerText=77;

  document.getElementById(key).innerText=value;
}
function get_qty(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
      return e.innerText
    }
}

function update_element_text(key,text) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
	e.innerText = text;
    }
}

function get_element_text(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return "";
    } else {
	return e.innerText;
    }
}

// -----------------------------------------------
function get_qty_int_dataval(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.getAttribute("dataval");
	var v = parseInt(av,10);
	if (isNaN(v)) {
	    return 0;
	} else {
	    return v;
	}
    }
}
function get_text_dataval(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.getAttribute("dataval");
	return av
    }
}

function key_exist(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	return 1;
    }
}

function get_qty_int_datacr(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.getAttribute("datacr");
	var v = parseInt(av,10);
	if (isNaN(v)) {
	    return 0;
	} else {
	    return v;
	}
    }
}
function get_qty_int_datadr(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.getAttribute("datadr");
	var v = parseInt(av,10);
	if (isNaN(v)) {
	    return 0;
	} else {
	    return v;
	}
    }
}

    ///set
function set_qty_int_dataval(key,val) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	e.setAttribute("dataval",val);
    }
}
function set_text_dataval(key,val) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	e.setAttribute("dataval",val);	
    }
}
function set_qty_int_datacr(key,val) {
    var e = document.getElementById(key);    
    if (e==null) {
	return 0;
    } else {
        e.setAttribute("datacr",val);
    }
}
function set_qty_int_datadr(key,val) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	e.setAttribute("datadr",val);
    }
}

//---------------------------------------------------

function get_qty_int_value2(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var av = e.value;
	var v = parseInt(av,10);
	if (isNaN(v)) {
	    return 0;
	} else {
	    return v;
	}
    }
}

function get_qty_int(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var a = parseInt(e.innerText,10);
	if (isNaN(a)) {
            return 0;
	} else {
	    return a;
	}
    }
}

function remove_row(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	p = e.parentNode
	p.parentNode.removeChild(p)
	return 1;
    }
}

function get_qty_int_flag(key) {
    var e = document.getElementById(key);
    if (e==null) {
	return 0;
    } else {
	var a = parseInt(e.innerText,10);
	if (isNaN(a)) {
            return 0;
	} else {
	    return 1;
	}
    }
}

function firstElementChild(key) {
    var e = document.getElementById(key);
    if ((e==null) || (e.firstElementChild==null)) {
	return "";
    } else {
	return e.firstElementChild.getAttribute("id");
    }
}

function nextElementSibling(key) {
    var e = document.getElementById(key);
    if ((e==null) || (e.nextElementSibling==null)) {
	return "";
    } else {
	return e.nextElementSibling.getAttribute("id");
    }
}

function console_log(msg) {
    console.log(msg);
}

//call_js_ptr = foreign FFI_JS "call_js_ptr(%0)" (Ptr -> JS_IO () )

function call_js_ptr(pev) {
    //console.log(pev)
    var a = parseInt(pev.target.value,10);
    return a
}


/* Adds a click event listener */
function onClick(selector, callback) {
    document.querySelector(selector).addEventListener('click', callback);
}

function onInput(selector, callback) {
    document.querySelector(selector).addEventListener('input', callback);
}


/* Does something on init event */
function onInit(callback) {
    document.addEventListener('init', callback);
}


function toggle_hide_snow_element(element_id) {
    var x = document.getElementById(element_id)
    if (x.style.display === "none") {
	x.style.display = "block";
    } else {
	x.style.display = "none";
    }
}


// --------------------




/*
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
 //0   xmlHttp.send( null );
    return xmlHttp.responseText;
}
*/

//var md = forge.md.sha1.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());


//var md = forge.md.sha256.create();
//md.update('The quick brown fox jumps over the lazy dog');
//console.log(md.digest().toHex());


function $partial_1_2$prim_95__95_strCons(x1){
    return (function(x2){
        return prim_95__95_strCons(x1, x2);
    });
}

function $partial_0_1$prim_95__95_toStrBigInt(){
    return (function(x1){
        return prim_95__95_toStrBigInt(x1);
    });
}

function $partial_0_1$prim_95__95_toStrInt(){
    return (function(x1){
        return prim_95__95_toStrInt(x1);
    });
}

function $partial_3_4$JSIO__JSIO__insert_95_adjancent_95_html(x1, x2, x3){
    return (function(x4){
        return JSIO__JSIO__insert_95_adjancent_95_html(x1, x2, x3, x4);
    });
}

function $partial_0_1$Prelude__Chars__isDigit(){
    return (function(x1){
        return Prelude__Chars__isDigit(x1);
    });
}

function $partial_2_3$Snippets2__make_95_cells_95_editable(x1, x2){
    return (function(x3){
        return Snippets2__make_95_cells_95_editable(x1, x2, x3);
    });
}

function $partial_3_4$Snippets2__tab_95_widget__on_95_table_95_set_95_whs_95_route(x1, x2, x3){
    return (function(x4){
        return Snippets2__tab_95_widget__on_95_table_95_set_95_whs_95_route(x1, x2, x3, x4);
    });
}

function $partial_3_4$Snippets2__tab_95_widget__on_95_table_95_whs_95_done(x1, x2, x3){
    return (function(x4){
        return Snippets2__tab_95_widget__on_95_table_95_whs_95_done(x1, x2, x3, x4);
    });
}

function $partial_2_3$Prelude__Show__protectEsc(x1, x2){
    return (function(x3){
        return Prelude__Show__protectEsc(x1, x2, x3);
    });
}

function $partial_2_3$Snippets2__read_95_cells_95_row(x1, x2){
    return (function(x3){
        return Snippets2__read_95_cells_95_row(x1, x2, x3);
    });
}

function $partial_3_4$Snippets2__runjsio(x1, x2, x3){
    return (function(x4){
        return Snippets2__runjsio(x1, x2, x3, x4);
    });
}

function $partial_2_3$JSIO__JSIO__set_95_text_95_dataval(x1, x2){
    return (function(x3){
        return JSIO__JSIO__set_95_text_95_dataval(x1, x2, x3);
    });
}

function $partial_2_3$JSIO__JSIO__update_95_element_95_text(x1, x2){
    return (function(x3){
        return JSIO__JSIO__update_95_element_95_text(x1, x2, x3);
    });
}

function $partial_5_6$Snippets2__tab_95_widget___123_add_95_whs_95_button_95_0_125_(x1, x2, x3, x4, x5){
    return (function(x6){
        return Snippets2__tab_95_widget___123_add_95_whs_95_button_95_0_125_(x1, x2, x3, x4, x5, x6);
    });
}

function $partial_4_5$Snippets2__tab_95_widget___123_add_95_whs_95_done_95_button_95_1_125_(x1, x2, x3, x4){
    return (function(x5){
        return Snippets2__tab_95_widget___123_add_95_whs_95_done_95_button_95_1_125_(x1, x2, x3, x4, x5);
    });
}

function $partial_0_1$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_2_125_(){
    return (function(x1){
        return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_2_125_(x1);
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_4_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_4_125_(x1, x2, x3);
        });
    });
}

function $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_5_125_(){
    return (function(x1){
        return (function(x2){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_5_125_(x1, x2);
        });
    });
}

function $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(){
    return (function(x1){
        return (function(x2){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(x1, x2);
        });
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_7_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_7_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_8_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_8_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_9_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_9_125_(x1, x2, x3);
        });
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_10_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_calc_95_order_95_t_95_10_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_11_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_calc_95_order_95_t_95_11_125_(x1, x2, x3);
        });
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_12_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_calc_95_order_95_t_95_12_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(){
    return (function(x1){
        return (function(x2){
            return Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(x1, x2);
        });
    });
}

function $partial_5_6$Snippets2__tab_95_widget___123_insert_95_rows2_95_15_125_(x1, x2, x3, x4, x5){
    return (function(x6){
        return Snippets2__tab_95_widget___123_insert_95_rows2_95_15_125_(x1, x2, x3, x4, x5, x6);
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_insert_95_rows2_95_16_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_insert_95_rows2_95_16_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_5_6$Snippets2__tab_95_widget___123_insert_95_table_95_18_125_(x1, x2, x3, x4, x5){
    return (function(x6){
        return Snippets2__tab_95_widget___123_insert_95_table_95_18_125_(x1, x2, x3, x4, x5, x6);
    });
}

function $partial_3_4$Snippets2___123_make_95_cells_95_ro_95_19_125_(x1, x2, x3){
    return (function(x4){
        return Snippets2___123_make_95_cells_95_ro_95_19_125_(x1, x2, x3, x4);
    });
}

function $partial_0_1$Snippets2___123_make_95_cells_95_ro_95_20_125_(){
    return (function(x1){
        return Snippets2___123_make_95_cells_95_ro_95_20_125_(x1);
    });
}

function $partial_3_4$Snippets2___123_make_95_cells_95_ro_95_21_125_(x1, x2, x3){
    return (function(x4){
        return Snippets2___123_make_95_cells_95_ro_95_21_125_(x1, x2, x3, x4);
    });
}

function $partial_1_2$JSIO__JSIO___123_onClick_95_22_125_(x1){
    return (function(x2){
        return JSIO__JSIO___123_onClick_95_22_125_(x1, x2);
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_23_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_23_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_24_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_24_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_25_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_25_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_26_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_26_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_28_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_28_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_32_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_32_125_(x1, x2, x3);
        });
    });
}

function $partial_0_2$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_33_125_(){
    return (function(x1){
        return (function(x2){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_33_125_(x1, x2);
        });
    });
}

function $partial_0_1$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_34_125_(){
    return (function(x1){
        return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_34_125_(x1);
    });
}

function $partial_2_4$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_35_125_(x1, x2){
    return (function(x3){
        return (function(x4){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_35_125_(x1, x2, x3, x4);
        });
    });
}

function $partial_4_6$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_36_125_(x1, x2, x3, x4){
    return (function(x5){
        return (function(x6){
            return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_36_125_(x1, x2, x3, x4, x5, x6);
        });
    });
}

function $partial_5_6$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_37_125_(x1, x2, x3, x4, x5){
    return (function(x6){
        return Snippets2__tab_95_widget___123_on_95_table_95_commit_95_37_125_(x1, x2, x3, x4, x5, x6);
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_edit_95_38_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_edit_95_38_125_(x1, x2, x3);
        });
    });
}

function $partial_2_3$Snippets2__tab_95_widget___123_on_95_table_95_edit_95_39_125_(x1, x2){
    return (function(x3){
        return Snippets2__tab_95_widget___123_on_95_table_95_edit_95_39_125_(x1, x2, x3);
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_set_95_whs_95_route_95_40_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_on_95_table_95_set_95_whs_95_route_95_40_125_(x1, x2, x3);
        });
    });
}

function $partial_3_4$Snippets2___123_read_95_cells_95_41_125_(x1, x2, x3){
    return (function(x4){
        return Snippets2___123_read_95_cells_95_41_125_(x1, x2, x3, x4);
    });
}

function $partial_2_3$Snippets2___123_read_95_cells_95_42_125_(x1, x2){
    return (function(x3){
        return Snippets2___123_read_95_cells_95_42_125_(x1, x2, x3);
    });
}

function $partial_2_3$Snippets2___123_read_95_cells_95_50_125_(x1, x2){
    return (function(x3){
        return Snippets2___123_read_95_cells_95_50_125_(x1, x2, x3);
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_52_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_52_125_(x1, x2, x3);
        });
    });
}

function $partial_1_3$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_54_125_(x1){
    return (function(x2){
        return (function(x3){
            return Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_54_125_(x1, x2, x3);
        });
    });
}

function $partial_0_2$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_57_125_(){
    return (function(x1){
        return (function(x2){
            return Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_57_125_(x1, x2);
        });
    });
}

function $partial_4_5$Snippets2___123_set_95_cells_95_attr_95_58_125_(x1, x2, x3, x4){
    return (function(x5){
        return Snippets2___123_set_95_cells_95_attr_95_58_125_(x1, x2, x3, x4, x5);
    });
}

function $partial_2_3$Snippets2___123_set_95_cells_95_attr_95_60_125_(x1, x2){
    return (function(x3){
        return Snippets2___123_set_95_cells_95_attr_95_60_125_(x1, x2, x3);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_61_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_61_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_62_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_62_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_63_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_63_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_64_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_64_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_65_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_65_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_66_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_66_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_67_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_67_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_68_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_68_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_69_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_69_125_(x1);
    });
}

function $partial_0_1$Prelude__Show___123_showLitChar_95_70_125_(){
    return (function(x1){
        return Prelude__Show___123_showLitChar_95_70_125_(x1);
    });
}

function $partial_1_2$Prelude__Show___123_showLitChar_95_71_125_(x1){
    return (function(x2){
        return Prelude__Show___123_showLitChar_95_71_125_(x1, x2);
    });
}

function $partial_1_2$Prelude__Show___123_showLitChar_95_72_125_(x1){
    return (function(x2){
        return Prelude__Show___123_showLitChar_95_72_125_(x1, x2);
    });
}

function $partial_4_5$Snippets2__tab_95_widget___123_table_95_amendments_95_73_125_(x1, x2, x3, x4){
    return (function(x5){
        return Snippets2__tab_95_widget___123_table_95_amendments_95_73_125_(x1, x2, x3, x4, x5);
    });
}

function $partial_6_7$Snippets2__tab_95_widget___123_table_95_composite_95_74_125_(x1, x2, x3, x4, x5, x6){
    return (function(x7){
        return Snippets2__tab_95_widget___123_table_95_composite_95_74_125_(x1, x2, x3, x4, x5, x6, x7);
    });
}

function $partial_2_3$Printf___123_toFunction_95_75_125_(x1, x2){
    return (function(x3){
        return Printf___123_toFunction_95_75_125_(x1, x2, x3);
    });
}

function $partial_2_3$Printf___123_toFunction_95_76_125_(x1, x2){
    return (function(x3){
        return Printf___123_toFunction_95_76_125_(x1, x2, x3);
    });
}

const $HC_0_0$MkUnit = ({type: 0});
const $HC_0_0$TheWorld = ({type: 0});
function $HC_2_2$DataStore_____42___($1, $2){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_1$Prelude__List___58__58_($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_1$DataStore__EField($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_3$Printf__FEnd = ({type: 3});
function $HC_1_0$Printf__FInt($1){
    this.type = 0;
    this.$1 = $1;
}

function $HC_2_2$Printf__FOther($1, $2){
    this.type = 2;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_1$Printf__FString($1){
    this.type = 1;
    this.$1 = $1;
}

const $HC_0_3$DataStore__FTterm = ({type: 3});
function $HC_2_0$DataStore__IField($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_1$Prelude__Maybe__Just($1){
    this.type = 1;
    this.$1 = $1;
}

function $HC_3_0$DataStore__MkMDList($1, $2, $3){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
    this.$3 = $3;
}

function $HC_2_0$DataStore__MkModelSchema($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_2_0$Builtins__MkPair($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

function $HC_1_3$DataStore__NSCode($1){
    this.type = 3;
    this.$1 = $1;
}

const $HC_0_0$Prelude__List__Nil = ({type: 0});
const $HC_0_1$Prelude__Basics__No = ({type: 1});
const $HC_0_0$Prelude__Maybe__Nothing = ({type: 0});
const $HC_0_0$Prelude__Show__Open = ({type: 0});
function $HC_2_1$Prelude__Strings__StrCons($1, $2){
    this.type = 1;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Prelude__Strings__StrNil = ({type: 0});
function $HC_2_0$DataStore__Tt($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

const $HC_0_0$Prelude__Basics__Yes = ({type: 0});
function $HC_2_0$Prelude__Applicative__Alternative_95_ictor($1, $2){
    this.type = 0;
    this.$1 = $1;
    this.$2 = $2;
}

// io_bind

function io_95_bind($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_k, $_5_w){
    return $_4_k($_3_arg($_5_w))($_5_w);
}

// prim__strCons

function prim_95__95_strCons($_0_arg, $_1_arg){
    return (($_0_arg)+($_1_arg));
}

// prim__toStrBigInt

function prim_95__95_toStrBigInt($_0_arg){
    return (($_0_arg).toString());
}

// prim__toStrInt

function prim_95__95_toStrInt($_0_arg){
    return (''+($_0_arg));
}

// Prelude.List.++

function Prelude__List___43__43_($_0_arg, $_1_arg, $_2_arg){
    
    if(($_1_arg.type === 1)) {
        return new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, Prelude__List___43__43_(null, $_1_arg.$2, $_2_arg));
    } else {
        return $_2_arg;
    }
}

// DataStore.addSchema2Vals

function DataStore__addSchema2Vals($_0_arg, $_1_arg, $_2_arg){
    
    if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            
            
            return new $HC_2_0$DataStore__Tt($_1_arg.$1.add($_2_arg.$1), $_1_arg.$2.add($_2_arg.$2));
        } else {
            $JSRTS.die("*** DataStore.idr:200:1-76:unmatched case in DataStore.addSchema2Vals ***");
        }
    } else {
        $JSRTS.die("*** DataStore.idr:200:1-76:unmatched case in DataStore.addSchema2Vals ***");
    }
}

// Snippets2.tab_widget.add_whs_button

function Snippets2__tab_95_widget__add_95_whs_95_button($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_3_in = ($_0_arg + ("__composite__" + $cg$1));
    const $_7_in = ($_3_in + "__commit_whs_route");
    return $partial_5_6$Snippets2__tab_95_widget___123_add_95_whs_95_button_95_0_125_($_3_in, $_7_in, $_0_arg, $_1_arg, $_2_arg);
}

// Snippets2.tab_widget.add_whs_done_button

function Snippets2__tab_95_widget__add_95_whs_95_done_95_button($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_3_in = ($_0_arg + ("__composite__" + $cg$1));
    const $_7_in = ($_3_in + "__commit_whs_done");
    return $partial_4_5$Snippets2__tab_95_widget___123_add_95_whs_95_done_95_button_95_1_125_($_3_in, $_7_in, $_1_arg, $_2_arg);
}

// Snippets2.tab_widget.calc_order_subtotals

function Snippets2__tab_95_widget__calc_95_order_95_subtotals($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_in){
    const $_7_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((($_0_arg + "__composite__items") + "__table"), $HC_0_0$Prelude__List__Nil, $_6_in);
    const $_8_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids("pricelist__composite__pricelist__table", $HC_0_0$Prelude__List__Nil, $_6_in);
    const $_9_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((($_1_arg + "__composite__subtotal") + "__table"), $HC_0_0$Prelude__List__Nil, $_6_in);
    const $_13_in = JSIO__JSIO__console_95_log(("[" + (Prelude__Show__Prelude__Show___64_Prelude__Show__Show_36_List_32_a_58__33_show_58_0_58_show_39__58_0(null, null, $partial_0_1$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_2_125_(), "", $_7_in) + "]")), $_6_in);
    const $_17_in = JSIO__JSIO__console_95_log(("[" + (Prelude__Show__Prelude__Show___64_Prelude__Show__Show_36_List_32_a_58__33_show_58_0_58_show_39__58_0(null, null, $partial_0_1$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_2_125_(), "", $_8_in) + "]")), $_6_in);
    let $cg$1 = null;
    $cg$1 = $_3_arg.$1;
    const $_20_in = Snippets2__read_95_cells_95_row($_7_in, $cg$1, $_6_in);
    let $cg$2 = null;
    $cg$2 = $_3_arg.$2;
    const $_23_in = Snippets2__read_95_cells_95_attr_95_row($_7_in, $cg$2, $_6_in);
    let $cg$3 = null;
    $cg$3 = $_4_arg.$1;
    const $_26_in = Snippets2__read_95_cells_95_row($_8_in, $cg$3, $_6_in);
    let $cg$4 = null;
    $cg$4 = $_4_arg.$2;
    const $_29_in = Snippets2__read_95_cells_95_attr_95_row($_8_in, $cg$4, $_6_in);
    const $_30_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_4_125_($_5_arg), $HC_0_0$Prelude__List__Nil, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_5_125_(), $HC_0_0$Prelude__List__Nil, Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_7_125_($_3_arg, $_5_arg), $HC_0_0$Prelude__List__Nil, $_23_in), Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_8_125_($_4_arg, $_5_arg), $HC_0_0$Prelude__List__Nil, $_29_in))));
    const $_55_in = JSIO__JSIO__console_95_log(Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, Prelude__List__length(null, $_30_in)), $_6_in);
    let $cg$5 = null;
    $cg$5 = $_5_arg.$1;
    const $_58_in = Snippets2__read_95_cells_95_row($_9_in, $cg$5, $_6_in);
    let $cg$6 = null;
    $cg$6 = $_5_arg.$2;
    const $_61_in = Snippets2__read_95_cells_95_attr_95_row($_9_in, $cg$6, $_6_in);
    const $_66_in = Snippets2__tab_95_widget__insert_95_rows_95_calc($_1_arg, $_5_arg, new $HC_3_0$DataStore__MkMDList("subtotal", Prelude__List___43__43_(null, $_58_in, $_58_in), Prelude__List___43__43_(null, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_9_125_($_5_arg), $HC_0_0$Prelude__List__Nil, $_61_in), $_30_in)), $_6_in);
    const $_67_in = Snippets2__tab_95_widget__calc_95_order_95_t($_1_arg, $_2_arg, new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), $_6_in);
    return $HC_0_0$MkUnit;
}

// Snippets2.tab_widget.calc_order_t

function Snippets2__tab_95_widget__calc_95_order_95_t($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_in){
    const $_5_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((($_0_arg + "__composite__subtotal") + "__table"), $HC_0_0$Prelude__List__Nil, $_4_in);
    const $_6_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((($_1_arg + "__composite__order_total") + "__table"), $HC_0_0$Prelude__List__Nil, $_4_in);
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_9_in = Snippets2__read_95_cells_95_row($_5_in, $cg$1, $_4_in);
    let $cg$2 = null;
    $cg$2 = $_2_arg.$2;
    const $_12_in = Snippets2__read_95_cells_95_attr_95_row($_5_in, $cg$2, $_4_in);
    let $cg$3 = null;
    $cg$3 = $_3_arg.$1;
    const $_15_in = Snippets2__read_95_cells_95_row($_6_in, $cg$3, $_4_in);
    let $cg$4 = null;
    $cg$4 = $_3_arg.$2;
    const $_18_in = Snippets2__read_95_cells_95_attr_95_row($_6_in, $cg$4, $_4_in);
    const $_45_in = Snippets2__tab_95_widget__insert_95_rows_95_calc($_1_arg, $_3_arg, new $HC_3_0$DataStore__MkMDList("order_total", Prelude__List___43__43_(null, $_15_in, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_10_125_($_2_arg, $_3_arg), $HC_0_0$Prelude__List__Nil, $_9_in)), Prelude__List___43__43_(null, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_11_125_($_3_arg), $HC_0_0$Prelude__List__Nil, $_18_in), Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_calc_95_order_95_t_95_12_125_($_2_arg, $_3_arg), $HC_0_0$Prelude__List__Nil, $_12_in))), $_4_in);
    return $HC_0_0$MkUnit;
}

// JSIO.SHA.calc_sha1

function JSIO__SHA__calc_95_sha1($_0_x, $_1_w){
    return (calc_sha1(($_0_x)));
}

// JSIO.SHA.calc_sha256

function JSIO__SHA__calc_95_sha256($_0_x, $_1_w){
    return (calc_sha256(($_0_x)));
}

// JSIO.JSIO.console_log

function JSIO__JSIO__console_95_log($_0_x, $_1_w){
    return (console_log(($_0_x)));
}

// Snippets2.tab_widget.convert_2sub

function Snippets2__tab_95_widget__convert_95_2sub($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_1_arg.type === 0)) {
            
            if(($_1_arg.$2.type === 3)) {
                
                if(($_0_arg.type === 0)) {
                    
                    if(($_0_arg.$2.type === 3)) {
                        return $_2_arg;
                    } else {
                        $JSRTS.die("*** Snippets2.idr:744:4-78:unmatched case in Snippets2.tab_widget.convert_2sub ***");
                    }
                } else if(($_0_arg.type === 2)) {
                    $_0_arg = $_0_arg;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg;
                } else {
                    $JSRTS.die("*** Snippets2.idr:744:4-78:unmatched case in Snippets2.tab_widget.convert_2sub ***");
                }
            } else {
                
                if(($_0_arg.type === 2)) {
                    $_0_arg = $_0_arg;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg;
                } else {
                    $JSRTS.die("*** Snippets2.idr:744:4-78:unmatched case in Snippets2.tab_widget.convert_2sub ***");
                }
            }
        } else {
            
            if(($_0_arg.type === 2)) {
                $_0_arg = $_0_arg;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg;
            } else {
                $JSRTS.die("*** Snippets2.idr:744:4-78:unmatched case in Snippets2.tab_widget.convert_2sub ***");
            }
        }
    }
}

// Snippets2.convert_s3LR_drop_col.convert_s3

function Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_s3($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $cg$6 = $_1_arg.$2;
            if(($cg$6.type === 3)) {
                
                if(($_0_arg.type === 1)) {
                    const $cg$10 = $_0_arg.$2;
                    if(($cg$10.type === 3)) {
                        return $_2_arg;
                    } else {
                        $JSRTS.die("*** Snippets2.idr:48:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_s3 ***");
                    }
                } else if(($_0_arg.type === 2)) {
                    $_0_arg = $_0_arg;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg;
                } else {
                    $JSRTS.die("*** Snippets2.idr:48:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_s3 ***");
                }
            } else {
                
                if(($_0_arg.type === 2)) {
                    $_0_arg = $_0_arg;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg;
                } else {
                    $JSRTS.die("*** Snippets2.idr:48:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_s3 ***");
                }
            }
        } else if(($_1_arg.type === 0)) {
            
            
            if(($_0_arg.type === 2)) {
                $_0_arg = $_0_arg;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg;
            } else {
                $JSRTS.die("*** Snippets2.idr:48:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_s3 ***");
            }
        } else {
            
            if(($_0_arg.type === 2)) {
                $_0_arg = $_0_arg;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg;
            } else {
                $JSRTS.die("*** Snippets2.idr:48:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_s3 ***");
            }
        }
    }
}

// Snippets2.convert_s3LR_drop_col.convert_sL

function Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_sL($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $cg$8 = $_1_arg.$2;
            if(($cg$8.type === 3)) {
                
                if(($_0_arg.type === 1)) {
                    const $cg$14 = $_0_arg.$2;
                    if(($cg$14.type === 3)) {
                        return $_2_arg;
                    } else {
                        $JSRTS.die("*** Snippets2.idr:58:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sL ***");
                    }
                } else if(($_0_arg.type === 2)) {
                    
                    $_0_arg = $_0_arg.$2;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg.$2;
                } else {
                    $JSRTS.die("*** Snippets2.idr:58:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sL ***");
                }
            } else {
                
                if(($_0_arg.type === 2)) {
                    
                    $_0_arg = $_0_arg.$2;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg.$2;
                } else {
                    $JSRTS.die("*** Snippets2.idr:58:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sL ***");
                }
            }
        } else if(($_1_arg.type === 0)) {
            
            
            if(($_0_arg.type === 2)) {
                
                $_0_arg = $_0_arg.$2;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.$2;
            } else {
                $JSRTS.die("*** Snippets2.idr:58:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sL ***");
            }
        } else {
            
            if(($_0_arg.type === 2)) {
                
                $_0_arg = $_0_arg.$2;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.$2;
            } else {
                $JSRTS.die("*** Snippets2.idr:58:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sL ***");
            }
        }
    }
}

// Snippets2.convert_s3LR_drop_col.convert_sR

function Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_sR($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $cg$8 = $_1_arg.$2;
            if(($cg$8.type === 3)) {
                
                if(($_0_arg.type === 1)) {
                    const $cg$14 = $_0_arg.$2;
                    if(($cg$14.type === 3)) {
                        return $_2_arg;
                    } else {
                        $JSRTS.die("*** Snippets2.idr:70:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sR ***");
                    }
                } else if(($_0_arg.type === 2)) {
                    
                    $_0_arg = $_0_arg.$1;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg.$1;
                } else {
                    $JSRTS.die("*** Snippets2.idr:70:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sR ***");
                }
            } else {
                
                if(($_0_arg.type === 2)) {
                    
                    $_0_arg = $_0_arg.$1;
                    $_1_arg = $_1_arg;
                    $_2_arg = $_2_arg.$1;
                } else {
                    $JSRTS.die("*** Snippets2.idr:70:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sR ***");
                }
            }
        } else if(($_1_arg.type === 0)) {
            
            
            if(($_0_arg.type === 2)) {
                
                $_0_arg = $_0_arg.$1;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.$1;
            } else {
                $JSRTS.die("*** Snippets2.idr:70:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sR ***");
            }
        } else {
            
            if(($_0_arg.type === 2)) {
                
                $_0_arg = $_0_arg.$1;
                $_1_arg = $_1_arg;
                $_2_arg = $_2_arg.$1;
            } else {
                $JSRTS.die("*** Snippets2.idr:70:3-73:unmatched case in Snippets2.convert_s3LR_drop_col.convert_sR ***");
            }
        }
    }
}

// DataStore.eqSchema2

function DataStore__eqSchema2($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_0_arg.type === 2)) {
            
            
            
            if(DataStore__eqSchema2($_0_arg.$1, $_1_arg.$1, $_2_arg.$1)) {
                $_0_arg = $_0_arg.$2;
                $_1_arg = $_1_arg.$2;
                $_2_arg = $_2_arg.$2;
            } else {
                return false;
            }
        } else if(($_0_arg.type === 1)) {
            const $cg$6 = $_0_arg.$2;
            return ($_1_arg == $_2_arg);
        } else {
            
            
            
            return $_1_arg.$1.add($_2_arg.$2).equals($_1_arg.$2.add($_2_arg.$1));
        }
    }
}

// JSIO.JSIO.firstElementChild

function JSIO__JSIO__firstElementChild($_0_x, $_1_w){
    return (firstElementChild(($_0_x)));
}

// Printf.format

function Printf__format($_0_arg){
    
    if(($_0_arg.type === 1)) {
        
        if(($_0_arg.$1 === "%")) {
            const $cg$4 = $_0_arg.$2;
            if(($cg$4.type === 1)) {
                const $cg$6 = $cg$4.$1;
                if(($cg$6 === "d")) {
                    return new $HC_1_0$Printf__FInt(Printf__format($cg$4.$2));
                } else if(($cg$6 === "s")) {
                    return new $HC_1_1$Printf__FString(Printf__format($cg$4.$2));
                } else {
                    return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
                }
            } else {
                return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
            }
        } else {
            return new $HC_2_2$Printf__FOther($_0_arg.$1, Printf__format($_0_arg.$2));
        }
    } else {
        return $HC_0_3$Printf__FEnd;
    }
}

// JSIO.JSIO.get_element_text

function JSIO__JSIO__get_95_element_95_text($_0_x, $_1_w){
    return (get_element_text(($_0_x)));
}

// JSIO.JSIO.get_qty_int

function JSIO__JSIO__get_95_qty_95_int($_0_x, $_1_w){
    return (get_qty_int(($_0_x)));
}

// JSIO.JSIO.get_qty_int_datacr

function JSIO__JSIO__get_95_qty_95_int_95_datacr($_0_x, $_1_w){
    return (get_qty_int_datacr(($_0_x)));
}

// JSIO.JSIO.get_qty_int_datadr

function JSIO__JSIO__get_95_qty_95_int_95_datadr($_0_x, $_1_w){
    return (get_qty_int_datadr(($_0_x)));
}

// JSIO.JSIO.get_qty_int_value2

function JSIO__JSIO__get_95_qty_95_int_95_value2($_0_x, $_1_w){
    return (get_qty_int_value2(($_0_x)));
}

// Snippets2.tab_widget.get_table_row_ids

function Snippets2__tab_95_widget__get_95_table_95_row_95_ids($_0_arg, $_1_arg, $_4_in){
    for(;;) {
        
        if(($_1_arg.type === 1)) {
            const $_8_in = JSIO__JSIO__nextElementSibling($_1_arg.$1, $_4_in);
            
            if((((($_8_in == "")) ? 1|0 : 0|0) === 0)) {
                $_0_arg = $_0_arg;
                $_1_arg = Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_8_in, new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, $HC_0_0$Prelude__List__Nil)), $_1_arg.$2);
                $_4_in = $_4_in;
            } else {
                return Prelude__List__reverseOnto(null, $HC_0_0$Prelude__List__Nil, Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, $HC_0_0$Prelude__List__Nil), $_1_arg.$2));
            }
        } else {
            const $_9_in = JSIO__JSIO__firstElementChild($_0_arg, $_4_in);
            $_0_arg = $_0_arg;
            $_1_arg = new $HC_2_1$Prelude__List___58__58_($_9_in, $HC_0_0$Prelude__List__Nil);
            $_4_in = $_4_in;
        }
    }
}

// JSIO.JSIO.get_text_dataval

function JSIO__JSIO__get_95_text_95_dataval($_0_x, $_1_w){
    return (get_text_dataval(($_0_x)));
}

// Prelude.Applicative.guard

function Prelude__Applicative__guard($_0_arg, $_1_arg, $_2_arg){
    
    if($_2_arg) {
        
        return $_1_arg.$1(null)($HC_0_0$MkUnit);
    } else {
        
        return $_1_arg.$2(null);
    }
}

// JSIO.JSIO.insert_adjancent_html

function JSIO__JSIO__insert_95_adjancent_95_html($_0_x, $_1_x1, $_2_x2, $_3_w){
    return (insert_adjancent_html(($_0_x),($_1_x1),($_2_x2)));
}

// Snippets2.tab_widget.insert_rows2

function Snippets2__tab_95_widget__insert_95_rows2($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$2;
    let $cg$2 = null;
    $cg$2 = $_2_arg.$3;
    return $partial_3_4$Snippets2__runjsio(null, $HC_0_0$MkUnit, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_insert_95_rows2_95_16_125_($_0_arg, $_1_arg), $HC_0_0$Prelude__List__Nil, Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), $cg$1, $cg$2)));
}

// Snippets2.tab_widget.insert_rows_calc

function Snippets2__tab_95_widget__insert_95_rows_95_calc($_0_arg, $_1_arg, $_2_arg, $_3_in){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_7_in = Snippets2__tab_95_widget__insert_95_rows2((($_0_arg + ("__composite__" + $cg$1)) + "__table"), $_1_arg, $_2_arg)($_3_in);
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$3 = null;
        if((((("Calculation:%s".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$4 = new $HC_2_1$Prelude__Strings__StrCons("Calculation:%s".slice(1)[0], "Calculation:%s".slice(1).slice(1));
        }
        
        $cg$2 = new $HC_2_1$Prelude__List___58__58_("Calculation:%s"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
    }
    
    return Snippets2__tab_95_widget__table_95_amendments(Printf__toFunction(Printf__format($cg$2), "")($_0_arg), "amendments_calc", $_1_arg, $_2_arg)($_3_in);
}

// Snippets2.tab_widget.insert_rows_x

function Snippets2__tab_95_widget__insert_95_rows_95_x($_0_arg, $_1_arg, $_2_arg, $_3_in){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_7_in = Snippets2__tab_95_widget__insert_95_rows2((($_0_arg + ("__composite__" + $cg$1)) + "__table"), $_1_arg, $_2_arg)($_3_in);
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$3 = null;
        if((((("Amendment:%s".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$4 = new $HC_2_1$Prelude__Strings__StrCons("Amendment:%s".slice(1)[0], "Amendment:%s".slice(1).slice(1));
        }
        
        $cg$2 = new $HC_2_1$Prelude__List___58__58_("Amendment:%s"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
    }
    
    return Snippets2__tab_95_widget__table_95_amendments(Printf__toFunction(Printf__format($cg$2), "")($_0_arg), "amendments", $_1_arg, $_2_arg)($_3_in);
}

// Snippets2.tab_widget.insert_table

function Snippets2__tab_95_widget__insert_95_table($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    const $_4_in = ($_0_arg + "__table");
    return $partial_5_6$Snippets2__tab_95_widget___123_insert_95_table_95_18_125_($_0_arg, $_3_arg, $_2_arg, $_4_in, $_1_arg);
}

// Snippets2.tab_widget.insert_table_wo_ids

function Snippets2__tab_95_widget__insert_95_table_95_wo_95_ids($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n            <!-- Content Amendments -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody>\n                    %s\n                </tbody>\n              </table>\n            </div>\n\n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n            <!-- Content Amendments -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody>\n                    %s\n                </tbody>\n              </table>\n            </div>\n\n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1)[0], "\n            <!-- Content Amendments -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody>\n                    %s\n                </tbody>\n              </table>\n            </div>\n\n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n            <!-- Content Amendments -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody>\n                    %s\n                </tbody>\n              </table>\n            </div>\n\n            </div>\n          </div>  <!-- /.card -->\n            "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    let $cg$4 = null;
    $cg$4 = $_2_arg.$1;
    let $cg$5 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$5 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$6 = null;
        if((((("<tr>%s %s</tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$6 = true;
        } else {
            $cg$6 = false;
        }
        
        let $cg$7 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$6, true).type === 1)) {
            $cg$7 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$7 = new $HC_2_1$Prelude__Strings__StrCons("<tr>%s %s</tr>".slice(1)[0], "<tr>%s %s</tr>".slice(1).slice(1));
        }
        
        $cg$5 = new $HC_2_1$Prelude__List___58__58_("<tr>%s %s</tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$7));
    }
    
    let $cg$8 = null;
    $cg$8 = $_1_arg.$1;
    let $cg$9 = null;
    $cg$9 = $_1_arg.$2;
    return $partial_3_4$JSIO__JSIO__insert_95_adjancent_95_html($_0_arg, "afterbegin", Printf__toFunction(Printf__format($cg$1), "")($cg$4)(Printf__toFunction(Printf__format($cg$5), "")(Snippets2__schema2thead2_58_ret_58_0($cg$8))(Snippets2__schema2thead2_58_ret_58_0($cg$9)))(Snippets2__tab_95_widget__render_95_rows_95_wo_95_ids($_1_arg, $_2_arg)));
}

// DataStore.integer2t

function DataStore__integer2t($_0_arg){
    
    if(((($_0_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) ? 1|0 : 0|0) === 0)) {
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($_0_arg, (new $JSRTS.jsbn.BigInteger(("0")))) > 0)) {
            return new $HC_2_0$DataStore__Tt($_0_arg, (new $JSRTS.jsbn.BigInteger(("0"))));
        } else {
            let $cg$3 = null;
            if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($_0_arg, (new $JSRTS.jsbn.BigInteger(("0")))) < 0)) {
                $cg$3 = (new $JSRTS.jsbn.BigInteger(("0"))).subtract($_0_arg);
            } else {
                $cg$3 = $_0_arg;
            }
            
            return new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), $cg$3);
        }
    } else {
        return new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0"))));
    }
}

// DataStore.invSchema2

function DataStore__invSchema2($_0_arg, $_1_arg){
    
    if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            
            return new $HC_2_0$DataStore__Tt($_1_arg.$2, $_1_arg.$1);
        } else {
            $JSRTS.die("*** DataStore.idr:193:1-63:unmatched case in DataStore.invSchema2 ***");
        }
    } else {
        $JSRTS.die("*** DataStore.idr:193:1-63:unmatched case in DataStore.invSchema2 ***");
    }
}

// Prelude.Chars.isDigit

function Prelude__Chars__isDigit($_0_arg){
    let $cg$1 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "0") > 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = ($_0_arg === "0");
    }
    
    
    if($cg$1) {
        
        if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "9") < 0)) {
            return true;
        } else {
            return ($_0_arg === "9");
        }
    } else {
        return false;
    }
}

// Main.items_ModelDataList

function Main__items_95_ModelDataList(){
    return new $HC_3_0$DataStore__MkMDList("items", $HC_0_0$Prelude__List__Nil, $HC_0_0$Prelude__List__Nil);
}

// Main.items_ModelDataList'

function Main__items_95_ModelDataList_39_(){
    return new $HC_3_0$DataStore__MkMDList("items", new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a1", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a2", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a3", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a4", "\xa3"), $HC_0_0$Prelude__List__Nil)))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("4"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("0")))), $HC_0_0$Prelude__List__Nil)))));
}

// Main.items_ModelDataList''

function Main__items_95_ModelDataList_39__39_(){
    return new $HC_3_0$DataStore__MkMDList("items", new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a1", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a2", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a3", "\xa3"), $HC_0_0$Prelude__List__Nil))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("2")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("1")))), $HC_0_0$Prelude__List__Nil))));
}

// JSIO.JSIO.key_exist

function JSIO__JSIO__key_95_exist($_0_x, $_1_w){
    return (key_exist(($_0_x)));
}

// Prelude.List.length

function Prelude__List__length($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        return Prelude__List__length(null, $_1_arg.$2).add((new $JSRTS.jsbn.BigInteger(("1"))));
    } else {
        return (new $JSRTS.jsbn.BigInteger(("0")));
    }
}

// Main.main

function Main__main($_0_in){
    const $_1_in = JSIO__SHA__calc_95_sha1("abc", $_0_in);
    const $_2_in = JSIO__SHA__calc_95_sha256("abc", $_0_in);
    const $_3_in = JSIO__JSIO__console_95_log($_1_in, $_0_in);
    const $_4_in = JSIO__JSIO__console_95_log($_2_in, $_0_in);
    const $_5_in = Snippets2__tab_95_widget__table_95_composite(false, "Pricelist", "pricelist", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("price", $HC_0_3$DataStore__FTterm)), Main__pricelist_95_ModelDataList())($_0_in);
    const $_6_in = Snippets2__tab_95_widget__table_95_composite(true, "Order1 Items", "order1", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_7_in = Snippets2__tab_95_widget__add_95_whs_95_button("order1", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_8_in = Snippets2__tab_95_widget__table_95_composite(false, "Order1 Subtotals", "subtotal", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__subtotal_95_ModelDataList())($_0_in);
    const $_9_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("subtotal", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__subtotal_95_ModelDataList(), $_0_in);
    const $_10_in = Snippets2__tab_95_widget__table_95_composite(false, "Invoice1 Subtotals", "invoice_subtotal", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__subtotal_95_ModelDataList())($_0_in);
    const $_11_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("invoice_subtotal", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__subtotal_95_ModelDataList(), $_0_in);
    const $_12_in = Snippets2__tab_95_widget__table_95_composite(false, "WHS Routing", "warehouse", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_13_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("warehouse", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__whs_95_ModelDataList(), $_0_in);
    const $_14_in = Snippets2__tab_95_widget__table_95_composite(true, "WHS Done", "warehouse_done", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_15_in = Snippets2__tab_95_widget__insert_95_rows_95_x("warehouse_done", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__whs_95_ModelDataList(), $_0_in);
    const $_16_in = Snippets2__tab_95_widget__add_95_whs_95_done_95_button("warehouse_done", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_17_in = Snippets2__tab_95_widget__table_95_composite(false, "WHS Backorders", "warehouse_backorders", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList())($_0_in);
    const $_18_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("warehouse_backorders", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__whs_95_ModelDataList(), $_0_in);
    const $_19_in = Snippets2__tab_95_widget__insert_95_rows_95_x("pricelist", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("price", $HC_0_3$DataStore__FTterm)), Main__pricelist_95_ModelDataList_39_(), $_0_in);
    const $_20_in = Snippets2__tab_95_widget__insert_95_rows_95_x("order1", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList_39_(), $_0_in);
    const $_21_in = Snippets2__tab_95_widget__insert_95_rows_95_x("order1", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), Main__items_95_ModelDataList_39__39_(), $_0_in);
    const $_22_in = Snippets2__tab_95_widget__table_95_composite(false, "Order Total", "order_total", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__t_95_ModelDataList())($_0_in);
    const $_23_in = Snippets2__tab_95_widget__table_95_composite(false, "Invoice Total", "invoice_total", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__t_95_ModelDataList())($_0_in);
    const $_24_in = Snippets2__tab_95_widget__table_95_composite(true, "Payment Received", "payment_received", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), Main__t_95_ModelDataList())($_0_in);
    return Snippets2__tab_95_widget__calc_95_order_95_subtotals("order1", "subtotal", "order_total", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("price", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), $_0_in);
}

// Snippets2.make_cells_editable

function Snippets2__make_95_cells_95_editable($_0_arg, $_1_arg, $_4_in){
    for(;;) {
        
        if(($_1_arg.type === 2)) {
            const $_36_in = Snippets2__make_95_cells_95_editable($_0_arg, $_1_arg.$1, $_4_in);
            $_0_arg = $_0_arg;
            $_1_arg = $_1_arg.$2;
            $_4_in = $_4_in;
        } else if(($_1_arg.type === 1)) {
            return $HC_0_0$MkUnit;
        } else {
            
            if(($_1_arg.$2.type === 3)) {
                const $_43_in = ($_0_arg + ("_" + $_1_arg.$1));
                const $_44_in = JSIO__JSIO__get_95_qty_95_int($_43_in, $_4_in);
                const $_45_in = JSIO__JSIO__update_95_element_95_text(($_0_arg + ("_" + $_1_arg.$1)), "", $_4_in);
                let $cg$3 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
                    $cg$3 = $HC_0_0$Prelude__List__Nil;
                } else {
                    let $cg$4 = null;
                    if((((("<input type=\"number\" class=\"form-control\" value=\"%d\" id=\"%s\">".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                        $cg$4 = true;
                    } else {
                        $cg$4 = false;
                    }
                    
                    let $cg$5 = null;
                    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                        $cg$5 = $HC_0_0$Prelude__Strings__StrNil;
                    } else {
                        $cg$5 = new $HC_2_1$Prelude__Strings__StrCons("<input type=\"number\" class=\"form-control\" value=\"%d\" id=\"%s\">".slice(1)[0], "<input type=\"number\" class=\"form-control\" value=\"%d\" id=\"%s\">".slice(1).slice(1));
                    }
                    
                    $cg$3 = new $HC_2_1$Prelude__List___58__58_("<input type=\"number\" class=\"form-control\" value=\"%d\" id=\"%s\">"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$5));
                }
                
                return JSIO__JSIO__insert_95_adjancent_95_html($_43_in, "beforeend", Printf__toFunction(Printf__format($cg$3), "")((new $JSRTS.jsbn.BigInteger(''+($_44_in))))((($_0_arg + ("_" + $_1_arg.$1)) + "_input_tag")), $_4_in);
            } else {
                return $HC_0_0$MkUnit;
            }
        }
    }
}

// Snippets2.make_cells_ro

function Snippets2__make_95_cells_95_ro($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 2)) {
        return $partial_3_4$Snippets2___123_make_95_cells_95_ro_95_19_125_($_0_arg, $_1_arg.$1, $_1_arg.$2);
    } else if(($_1_arg.type === 1)) {
        return $partial_0_1$Snippets2___123_make_95_cells_95_ro_95_20_125_();
    } else if(($_1_arg.type === 0)) {
        return $partial_3_4$Snippets2___123_make_95_cells_95_ro_95_21_125_($_1_arg.$2, $_0_arg, $_1_arg.$1);
    } else {
        $JSRTS.die("*** Snippets2.idr:227:1-233:69:unmatched case in Snippets2.make_cells_ro ***");
    }
}

// DataStore.mulSchema2Vals

function DataStore__mulSchema2Vals($_0_arg, $_1_arg, $_2_arg){
    
    if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            let $cg$3 = null;
            $cg$3 = $_1_arg.$1.subtract($_1_arg.$2);
            let $cg$4 = null;
            $cg$4 = $_2_arg.$1.subtract($_2_arg.$2);
            return DataStore__integer2t($cg$3.multiply($cg$4));
        } else {
            $JSRTS.die("*** DataStore.idr:207:1-77:unmatched case in DataStore.mulSchema2Vals ***");
        }
    } else {
        $JSRTS.die("*** DataStore.idr:207:1-77:unmatched case in DataStore.mulSchema2Vals ***");
    }
}

// JSIO.JSIO.nextElementSibling

function JSIO__JSIO__nextElementSibling($_0_x, $_1_w){
    return (nextElementSibling(($_0_x)));
}

// JSIO.JSIO.onClick

function JSIO__JSIO__onClick($_0_arg, $_1_arg, $_2_w){
    return (onClick(($_0_arg), ((function(x){
        return $partial_1_2$JSIO__JSIO___123_onClick_95_22_125_($_1_arg)(x)(null);
    }))));
}

// Snippets2.tab_widget.on_set_backorders

function Snippets2__tab_95_widget__on_95_set_95_backorders($_0_arg, $_1_arg, $_2_arg, $_3_in){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_7_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((("warehouse_backorders" + ("__composite__" + $cg$1)) + "__table"), $HC_0_0$Prelude__List__Nil, $_3_in);
    let $cg$2 = null;
    $cg$2 = $_1_arg.$1;
    const $_10_in = Snippets2__read_95_cells_95_row($_7_in, $cg$2, $_3_in);
    let $cg$3 = null;
    $cg$3 = $_1_arg.$2;
    const $_13_in = Snippets2__read_95_cells_95_attr_95_row($_7_in, $cg$3, $_3_in);
    let $cg$4 = null;
    $cg$4 = $_2_arg.$1;
    const $_17_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((("warehouse" + ("__composite__" + $cg$4)) + "__table"), $HC_0_0$Prelude__List__Nil, $_3_in);
    let $cg$5 = null;
    $cg$5 = $_1_arg.$1;
    const $_20_in = Snippets2__read_95_cells_95_row($_17_in, $cg$5, $_3_in);
    let $cg$6 = null;
    $cg$6 = $_1_arg.$2;
    const $_23_in = Snippets2__read_95_cells_95_attr_95_row($_17_in, $cg$6, $_3_in);
    let $cg$7 = null;
    $cg$7 = $_2_arg.$1;
    const $_27_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((("warehouse_done" + ("__composite__" + $cg$7)) + "__table"), $HC_0_0$Prelude__List__Nil, $_3_in);
    let $cg$8 = null;
    $cg$8 = $_1_arg.$1;
    const $_30_in = Snippets2__read_95_cells_95_row($_27_in, $cg$8, $_3_in);
    let $cg$9 = null;
    $cg$9 = $_1_arg.$2;
    const $_33_in = Snippets2__read_95_cells_95_attr_95_row($_27_in, $cg$9, $_3_in);
    let $cg$10 = null;
    $cg$10 = $_2_arg.$1;
    const $_45_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("warehouse_backorders", $_1_arg, new $HC_3_0$DataStore__MkMDList($cg$10, Prelude__List___43__43_(null, $_10_in, Prelude__List___43__43_(null, $_20_in, $_30_in)), Prelude__List___43__43_(null, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_23_125_($_1_arg), $HC_0_0$Prelude__List__Nil, $_13_in), Prelude__List___43__43_(null, $_23_in, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_24_125_($_1_arg), $HC_0_0$Prelude__List__Nil, $_33_in)))), $_3_in);
    return $HC_0_0$MkUnit;
}

// Snippets2.tab_widget.on_table_commit

function Snippets2__tab_95_widget__on_95_table_95_commit($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_3_in = ($_0_arg + ("__composite__" + $cg$1));
    const $_7_in = ($_3_in + "__table");
    return $partial_5_6$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_37_125_($_3_in, $_7_in, $_1_arg, $_0_arg, $_2_arg);
}

// Snippets2.tab_widget.on_table_edit

function Snippets2__tab_95_widget__on_95_table_95_edit($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_3_in = ($_0_arg + ("__composite__" + $cg$1));
    return $partial_2_3$Snippets2__tab_95_widget___123_on_95_table_95_edit_95_39_125_($_3_in, $_1_arg);
}

// Snippets2.tab_widget.on_table_set_whs_route

function Snippets2__tab_95_widget__on_95_table_95_set_95_whs_95_route($_0_arg, $_1_arg, $_2_arg, $_3_in){
    const $_4_in = JSIO__JSIO__console_95_log("updating whs route", $_3_in);
    let $cg$1 = null;
    $cg$1 = $_2_arg.$1;
    const $_8_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((($_0_arg + ("__composite__" + $cg$1)) + "__table"), $HC_0_0$Prelude__List__Nil, $_3_in);
    let $cg$2 = null;
    $cg$2 = $_1_arg.$1;
    const $_11_in = Snippets2__read_95_cells_95_row($_8_in, $cg$2, $_3_in);
    let $cg$3 = null;
    $cg$3 = $_1_arg.$2;
    const $_14_in = Snippets2__read_95_cells_95_attr_95_row($_8_in, $cg$3, $_3_in);
    let $cg$4 = null;
    $cg$4 = $_2_arg.$1;
    const $_18_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids((("warehouse" + ("__composite__" + $cg$4)) + "__table"), $HC_0_0$Prelude__List__Nil, $_3_in);
    let $cg$5 = null;
    $cg$5 = $_1_arg.$1;
    const $_21_in = Snippets2__read_95_cells_95_row($_18_in, $cg$5, $_3_in);
    let $cg$6 = null;
    $cg$6 = $_1_arg.$2;
    const $_24_in = Snippets2__read_95_cells_95_attr_95_row($_18_in, $cg$6, $_3_in);
    let $cg$7 = null;
    $cg$7 = $_2_arg.$1;
    const $_32_in = Snippets2__tab_95_widget__insert_95_rows_95_calc("warehouse", $_1_arg, new $HC_3_0$DataStore__MkMDList($cg$7, Prelude__List___43__43_(null, $_11_in, $_21_in), Prelude__List___43__43_(null, $_14_in, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_set_95_whs_95_route_95_40_125_($_1_arg), $HC_0_0$Prelude__List__Nil, $_24_in))), $_3_in);
    return Snippets2__tab_95_widget__on_95_set_95_backorders(null, $_1_arg, $_2_arg, $_3_in);
}

// Snippets2.tab_widget.on_table_whs_done

function Snippets2__tab_95_widget__on_95_table_95_whs_95_done($_0_arg, $_1_arg, $_2_arg, $_3_in){
    const $_4_in = JSIO__JSIO__console_95_log("updating whs done", $_3_in);
    const $_5_in = Snippets2__tab_95_widget__on_95_set_95_backorders(null, $_1_arg, $_2_arg, $_3_in);
    return Snippets2__tab_95_widget__calc_95_order_95_subtotals("warehouse_done", "invoice_subtotal", "invoice_total", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("price", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), $_3_in);
}

// Main.pricelist_ModelDataList

function Main__pricelist_95_ModelDataList(){
    return new $HC_3_0$DataStore__MkMDList("pricelist", $HC_0_0$Prelude__List__Nil, $HC_0_0$Prelude__List__Nil);
}

// Main.pricelist_ModelDataList'

function Main__pricelist_95_ModelDataList_39_(){
    return new $HC_3_0$DataStore__MkMDList("pricelist", new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a1", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a2", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a3", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a4", "\xa3"), $HC_0_0$Prelude__List__Nil)))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("3"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("7"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("1"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("2"))), (new $JSRTS.jsbn.BigInteger(("0")))), $HC_0_0$Prelude__List__Nil)))));
}

// Prelude.Show.primNumShow

function Prelude__Show__primNumShow($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    const $_4_in = $_1_arg($_3_arg);
    let $cg$1 = null;
    $cg$1 = (new $JSRTS.jsbn.BigInteger(("0")));
    let $cg$2 = null;
    if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($cg$1, (new $JSRTS.jsbn.BigInteger(("5")))) > 0)) {
        $cg$2 = true;
    } else {
        let $cg$3 = null;
        $cg$3 = (new $JSRTS.jsbn.BigInteger(("0")));
        $cg$2 = $cg$3.equals((new $JSRTS.jsbn.BigInteger(("5"))));
    }
    
    let $cg$4 = null;
    if($cg$2) {
        let $cg$5 = null;
        if((((($_4_in == "")) ? 1|0 : 0|0) === 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = false;
        }
        
        
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
            $cg$4 = false;
        } else {
            $cg$4 = ($_4_in[0] === "-");
        }
    } else {
        $cg$4 = false;
    }
    
    
    if($cg$4) {
        return ("(" + ($_4_in + ")"));
    } else {
        return $_4_in;
    }
}

// Prelude.Show.protectEsc

function Prelude__Show__protectEsc($_0_arg, $_1_arg, $_2_arg){
    let $cg$1 = null;
    if((((($_2_arg == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        $cg$2 = false;
    } else {
        $cg$2 = $_0_arg($_2_arg[0]);
    }
    
    let $cg$3 = null;
    if($cg$2) {
        $cg$3 = "\\&";
    } else {
        $cg$3 = "";
    }
    
    return ($_1_arg + ($cg$3 + $_2_arg));
}

// Snippets2.read_cells

function Snippets2__read_95_cells($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 2)) {
        return $partial_3_4$Snippets2___123_read_95_cells_95_41_125_($_0_arg, $_1_arg.$1, $_1_arg.$2);
    } else if(($_1_arg.type === 1)) {
        const $cg$4 = $_1_arg.$2;
        if(($cg$4.type === 3)) {
            return $partial_2_3$Snippets2___123_read_95_cells_95_42_125_($_0_arg, $_1_arg.$1);
        } else {
            $JSRTS.die("*** Snippets2.idr:252:1-255:61:unmatched case in Snippets2.read_cells ***");
        }
    } else if(($_1_arg.type === 0)) {
        
        if(($_1_arg.$2.type === 3)) {
            return $partial_2_3$Snippets2___123_read_95_cells_95_50_125_($_0_arg, $_1_arg.$1);
        } else {
            $JSRTS.die("*** Snippets2.idr:252:1-255:61:unmatched case in Snippets2.read_cells ***");
        }
    } else {
        $JSRTS.die("*** Snippets2.idr:252:1-255:61:unmatched case in Snippets2.read_cells ***");
    }
}

// Snippets2.read_cells_attr

function Snippets2__read_95_cells_95_attr($_0_arg, $_1_arg, $_4_in){
    
    if(($_1_arg.type === 2)) {
        const $_50_in = Snippets2__read_95_cells_95_attr($_0_arg, $_1_arg.$1, $_4_in);
        const $_51_in = Snippets2__read_95_cells_95_attr($_0_arg, $_1_arg.$2, $_4_in);
        return new $HC_2_0$Builtins__MkPair($_50_in, $_51_in);
    } else if(($_1_arg.type === 1)) {
        const $cg$4 = $_1_arg.$2;
        const $_55_in = JSIO__JSIO__get_95_text_95_dataval(($_0_arg + ("_" + $_1_arg.$1)), $_4_in);
        return $_55_in;
    } else {
        
        const $_66_in = ($_0_arg + ("_" + $_1_arg.$1));
        const $_67_in = JSIO__JSIO__get_95_qty_95_int_95_datadr($_66_in, $_4_in);
        const $_68_in = JSIO__JSIO__get_95_qty_95_int_95_datacr($_66_in, $_4_in);
        return new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(''+($_67_in))), (new $JSRTS.jsbn.BigInteger(''+($_68_in))));
    }
}

// Snippets2.read_cells_attr_row

function Snippets2__read_95_cells_95_attr_95_row($_0_arg, $_1_arg, $_4_in){
    
    if(($_0_arg.type === 1)) {
        const $_8_in = Snippets2__read_95_cells_95_attr($_0_arg.$1, $_1_arg, $_4_in);
        const $_9_in = Snippets2__read_95_cells_95_attr_95_row($_0_arg.$2, $_1_arg, $_4_in);
        return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_8_in, $HC_0_0$Prelude__List__Nil), $_9_in);
    } else {
        return $_0_arg;
    }
}

// Snippets2.read_cells_row

function Snippets2__read_95_cells_95_row($_0_arg, $_1_arg, $_4_in){
    
    if(($_0_arg.type === 1)) {
        const $_8_in = Snippets2__read_95_cells($_0_arg.$1, $_1_arg)($_4_in);
        const $_9_in = Snippets2__read_95_cells_95_row($_0_arg.$2, $_1_arg, $_4_in);
        return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_8_in, $HC_0_0$Prelude__List__Nil), $_9_in);
    } else {
        return $_0_arg;
    }
}

// Snippets2.renderDataAsKey

function Snippets2__renderDataAsKey($_0_arg, $_1_arg){
    
    if(($_0_arg.type === 2)) {
        
        return (Snippets2__renderDataAsKey($_0_arg.$1, $_1_arg.$1) + Snippets2__renderDataAsKey($_0_arg.$2, $_1_arg.$2));
    } else if(($_0_arg.type === 1)) {
        const $cg$5 = $_0_arg.$2;
        if(($cg$5.type === 3)) {
            return $_1_arg;
        } else {
            $JSRTS.die("*** Snippets2.idr:513:1-62:unmatched case in Snippets2.renderDataAsKey ***");
        }
    } else if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            let $cg$3 = null;
            $cg$3 = $_1_arg.$1.subtract($_1_arg.$2);
            return (($cg$3).toString());
        } else {
            $JSRTS.die("*** Snippets2.idr:513:1-62:unmatched case in Snippets2.renderDataAsKey ***");
        }
    } else {
        $JSRTS.die("*** Snippets2.idr:513:1-62:unmatched case in Snippets2.renderDataAsKey ***");
    }
}

// Snippets2.render_with_ids.renderDataWithSchema2

function Snippets2__render_95_with_95_ids__renderDataWithSchema2($_0_arg, $_1_arg, $_2_arg){
    
    if(($_0_arg.type === 2)) {
        
        return Prelude__List___43__43_(null, Snippets2__render_95_with_95_ids__renderDataWithSchema2($_0_arg.$1, $_1_arg, $_2_arg.$1), Snippets2__render_95_with_95_ids__renderDataWithSchema2($_0_arg.$2, $_1_arg, $_2_arg.$2));
    } else if(($_0_arg.type === 1)) {
        const $cg$10 = $_0_arg.$2;
        let $cg$11 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$11 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$12 = null;
            if((((("<td id=\"%s\" dataval=\"%s\">%s</td>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$12 = true;
            } else {
                $cg$12 = false;
            }
            
            let $cg$13 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$12, true).type === 1)) {
                $cg$13 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$13 = new $HC_2_1$Prelude__Strings__StrCons("<td id=\"%s\" dataval=\"%s\">%s</td>".slice(1)[0], "<td id=\"%s\" dataval=\"%s\">%s</td>".slice(1).slice(1));
            }
            
            $cg$11 = new $HC_2_1$Prelude__List___58__58_("<td id=\"%s\" dataval=\"%s\">%s</td>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$13));
        }
        
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$11), "")(($_1_arg + ("_" + $_0_arg.$1)))($_2_arg)($_2_arg), $HC_0_0$Prelude__List__Nil);
    } else {
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$4 = null;
            if((((("<td id=\"%s\" datadr=\"%d\" datacr=\"%d\">%d</td>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$4 = true;
            } else {
                $cg$4 = false;
            }
            
            let $cg$5 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                $cg$5 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$5 = new $HC_2_1$Prelude__Strings__StrCons("<td id=\"%s\" datadr=\"%d\" datacr=\"%d\">%d</td>".slice(1)[0], "<td id=\"%s\" datadr=\"%d\" datacr=\"%d\">%d</td>".slice(1).slice(1));
            }
            
            $cg$3 = new $HC_2_1$Prelude__List___58__58_("<td id=\"%s\" datadr=\"%d\" datacr=\"%d\">%d</td>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$5));
        }
        
        let $cg$6 = null;
        $cg$6 = $_2_arg.$1;
        let $cg$7 = null;
        $cg$7 = $_2_arg.$2;
        let $cg$8 = null;
        $cg$8 = $_2_arg.$1.subtract($_2_arg.$2);
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$3), "")(($_1_arg + ("_" + $_0_arg.$1)))($cg$6)($cg$7)($cg$8), $HC_0_0$Prelude__List__Nil);
    }
}

// Snippets2.render_wo_ids.renderDataWithSchema2

function Snippets2__render_95_wo_95_ids__renderDataWithSchema2($_0_arg, $_1_arg){
    
    if(($_0_arg.type === 2)) {
        
        return Prelude__List___43__43_(null, Snippets2__render_95_wo_95_ids__renderDataWithSchema2($_0_arg.$1, $_1_arg.$1), Snippets2__render_95_wo_95_ids__renderDataWithSchema2($_0_arg.$2, $_1_arg.$2));
    } else if(($_0_arg.type === 1)) {
        const $cg$8 = $_0_arg.$2;
        let $cg$9 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$9 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$10 = null;
            if((((("<td>%s</td>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$10 = true;
            } else {
                $cg$10 = false;
            }
            
            let $cg$11 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$10, true).type === 1)) {
                $cg$11 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$11 = new $HC_2_1$Prelude__Strings__StrCons("<td>%s</td>".slice(1)[0], "<td>%s</td>".slice(1).slice(1));
            }
            
            $cg$9 = new $HC_2_1$Prelude__List___58__58_("<td>%s</td>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$11));
        }
        
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$9), "")($_1_arg), $HC_0_0$Prelude__List__Nil);
    } else {
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$4 = null;
            if((((("<td>%d</td>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$4 = true;
            } else {
                $cg$4 = false;
            }
            
            let $cg$5 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                $cg$5 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$5 = new $HC_2_1$Prelude__Strings__StrCons("<td>%d</td>".slice(1)[0], "<td>%d</td>".slice(1).slice(1));
            }
            
            $cg$3 = new $HC_2_1$Prelude__List___58__58_("<td>%d</td>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$5));
        }
        
        let $cg$6 = null;
        $cg$6 = $_1_arg.$1.subtract($_1_arg.$2);
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$3), "")($cg$6), $HC_0_0$Prelude__List__Nil);
    }
}

// Snippets2.tab_widget.render_rows_wo_ids

function Snippets2__tab_95_widget__render_95_rows_95_wo_95_ids($_0_arg, $_1_arg){
    let $cg$1 = null;
    $cg$1 = $_1_arg.$2;
    const $_2_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_52_125_($_0_arg), $HC_0_0$Prelude__List__Nil, $cg$1);
    let $cg$2 = null;
    $cg$2 = $_1_arg.$3;
    const $_12_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_54_125_($_0_arg), $HC_0_0$Prelude__List__Nil, $cg$2);
    const $_22_in = Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), $_2_in, $_12_in);
    return Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_57_125_(), $HC_0_0$Prelude__List__Nil, $_22_in));
}

// Prelude.List.reverseOnto

function Prelude__List__reverseOnto($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_2_arg.type === 1)) {
            $_0_arg = null;
            $_1_arg = new $HC_2_1$Prelude__List___58__58_($_2_arg.$1, $_1_arg);
            $_2_arg = $_2_arg.$2;
        } else {
            return $_1_arg;
        }
    }
}

// Snippets2.runjsio

function Snippets2__runjsio($_0_arg, $_1_arg, $_2_arg, $_5_in){
    
    if(($_2_arg.type === 1)) {
        const $_9_in = $_2_arg.$1($_5_in);
        const $_10_in = Snippets2__runjsio(null, $_1_arg, $_2_arg.$2, $_5_in);
        return $_9_in;
    } else {
        return $_1_arg;
    }
}

// DataStore.schema2ZeroVal

function DataStore__schema2ZeroVal($_0_arg){
    
    if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            return new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0"))));
        } else {
            $JSRTS.die("*** DataStore.idr:169:1-47:unmatched case in DataStore.schema2ZeroVal ***");
        }
    } else {
        $JSRTS.die("*** DataStore.idr:169:1-47:unmatched case in DataStore.schema2ZeroVal ***");
    }
}

// Snippets2.set_cells_attr

function Snippets2__set_95_cells_95_attr($_0_arg, $_1_arg, $_2_arg){
    
    if(($_0_arg.type === 2)) {
        return $partial_4_5$Snippets2___123_set_95_cells_95_attr_95_58_125_($_2_arg, $_0_arg.$1, $_1_arg, $_0_arg.$2);
    } else if(($_0_arg.type === 1)) {
        const $cg$4 = $_0_arg.$2;
        return $partial_2_3$JSIO__JSIO__set_95_text_95_dataval(($_1_arg + ("_" + $_0_arg.$1)), $_2_arg);
    } else {
        
        const $_25_in = ($_1_arg + ("_" + $_0_arg.$1));
        return $partial_2_3$Snippets2___123_set_95_cells_95_attr_95_60_125_($_25_in, $_2_arg);
    }
}

// JSIO.JSIO.set_qty_int_datacr

function JSIO__JSIO__set_95_qty_95_int_95_datacr($_0_x, $_1_x1, $_2_w){
    return (set_qty_int_datacr(($_0_x),($_1_x1)));
}

// JSIO.JSIO.set_qty_int_datadr

function JSIO__JSIO__set_95_qty_95_int_95_datadr($_0_x, $_1_x1, $_2_w){
    return (set_qty_int_datadr(($_0_x),($_1_x1)));
}

// JSIO.JSIO.set_text_dataval

function JSIO__JSIO__set_95_text_95_dataval($_0_x, $_1_x1, $_2_w){
    return (set_text_dataval(($_0_x),($_1_x1)));
}

// Prelude.Show.showLitChar

function Prelude__Show__showLitChar($_0_arg){
    
    if(($_0_arg === "\x07")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_61_125_();
    } else if(($_0_arg === "\b")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_62_125_();
    } else if(($_0_arg === "\t")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_63_125_();
    } else if(($_0_arg === "\n")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_64_125_();
    } else if(($_0_arg === "\v")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_65_125_();
    } else if(($_0_arg === "\f")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_66_125_();
    } else if(($_0_arg === "\r")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_67_125_();
    } else if(($_0_arg === "\x0e")) {
        return $partial_2_3$Prelude__Show__protectEsc($partial_0_1$Prelude__Show___123_showLitChar_95_68_125_(), "\\SO");
    } else if(($_0_arg === "\\")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_69_125_();
    } else if(($_0_arg === "\x7f")) {
        return $partial_0_1$Prelude__Show___123_showLitChar_95_70_125_();
    } else {
        const $cg$3 = Prelude__Show__showLitChar_58_getAt_58_10(null, (new $JSRTS.jsbn.BigInteger(''+((($_0_arg).charCodeAt(0)|0)))), Prelude__Show__showLitChar_58_asciiTab_58_10(null));
        if(($cg$3.type === 1)) {
            return $partial_1_2$Prelude__Show___123_showLitChar_95_71_125_($cg$3.$1);
        } else {
            
            if((Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, "\x7f") > 0)) {
                return $partial_1_2$Prelude__Show___123_showLitChar_95_72_125_($_0_arg);
            } else {
                return $partial_1_2$prim_95__95_strCons($_0_arg);
            }
        }
    }
}

// Prelude.Show.showLitString

function Prelude__Show__showLitString($_0_arg, $_4_in){
    
    if(($_0_arg.type === 1)) {
        
        if(($_0_arg.$1 === "\"")) {
            return ("\\\"" + Prelude__Show__showLitString($_0_arg.$2, $_4_in));
        } else {
            return Prelude__Show__showLitChar($_0_arg.$1)(Prelude__Show__showLitString($_0_arg.$2, $_4_in));
        }
    } else {
        return $_4_in;
    }
}

// Main.subtotal_ModelDataList

function Main__subtotal_95_ModelDataList(){
    return new $HC_3_0$DataStore__MkMDList("subtotal", new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a1", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a2", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a3", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a4", "\xa3"), $HC_0_0$Prelude__List__Nil)))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), $HC_0_0$Prelude__List__Nil)))));
}

// Main.t_ModelDataList

function Main__t_95_ModelDataList(){
    return new $HC_3_0$DataStore__MkMDList("order_total", new $HC_2_1$Prelude__List___58__58_("\xa3", $HC_0_0$Prelude__List__Nil), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), $HC_0_0$Prelude__List__Nil));
}

// Snippets2.tab_widget.table_amendments

function Snippets2__tab_95_widget__table_95_amendments($_0_arg, $_1_arg, $_2_arg, $_3_arg){
    const $_4_in = $_1_arg;
    return $partial_4_5$Snippets2__tab_95_widget___123_table_95_amendments_95_73_125_($_4_in, $_2_arg, $_3_arg, $_0_arg);
}

// Snippets2.tab_widget.table_composite

function Snippets2__tab_95_widget__table_95_composite($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    let $cg$1 = null;
    $cg$1 = $_4_arg.$1;
    const $_5_in = ($_2_arg + ("__composite__" + $cg$1));
    return $partial_6_7$Snippets2__tab_95_widget___123_table_95_composite_95_74_125_($_2_arg, $_5_in, $_1_arg, $_3_arg, $_4_arg, $_0_arg);
}

// Printf.toFunction

function Printf__toFunction($_0_arg, $_1_arg){
    let $tco$$_1_arg = $_1_arg;
    for(;;) {
        
        if(($_0_arg.type === 3)) {
            return $_1_arg;
        } else if(($_0_arg.type === 0)) {
            return $partial_2_3$Printf___123_toFunction_95_75_125_($_0_arg.$1, $_1_arg);
        } else if(($_0_arg.type === 2)) {
            $tco$$_1_arg = ($_1_arg + (($_0_arg.$1)+("")));
            $_0_arg = $_0_arg.$2;
            $_1_arg = $tco$$_1_arg;
        } else {
            return $partial_2_3$Printf___123_toFunction_95_76_125_($_0_arg.$1, $_1_arg);
        }
    }
}

// JSIO.JSIO.toggle_hide_show_element

function JSIO__JSIO__toggle_95_hide_95_show_95_element($_0_x, $_1_w){
    return (toggle_hide_snow_element(($_0_x)));
}

// Prelude.List.unzip

function Prelude__List__unzip($_0_arg, $_1_arg, $_2_arg){
    
    if(($_2_arg.type === 1)) {
        const $cg$3 = $_2_arg.$1;
        const $cg$5 = Prelude__List__unzip(null, null, $_2_arg.$2);
        return new $HC_2_0$Builtins__MkPair(new $HC_2_1$Prelude__List___58__58_($cg$3.$1, $cg$5.$1), new $HC_2_1$Prelude__List___58__58_($cg$3.$2, $cg$5.$2));
    } else {
        return new $HC_2_0$Builtins__MkPair($HC_0_0$Prelude__List__Nil, $HC_0_0$Prelude__List__Nil);
    }
}

// Snippets2.tab_widget.update_cells_ke1

function Snippets2__tab_95_widget__update_95_cells_95_ke1($_0_arg, $_1_arg, $_2_arg, $_3_in){
    const $_4_in = Snippets2__read_95_cells($_0_arg, $_1_arg)($_3_in);
    const $_5_in = Snippets2__update_95_cells_95_td($_1_arg, $_0_arg, DataStore__addSchema2Vals($_1_arg, $_4_in, $_2_arg))($_3_in);
    return Snippets2__set_95_cells_95_attr($_1_arg, $_0_arg, DataStore__addSchema2Vals($_1_arg, $_4_in, $_2_arg))($_3_in);
}

// Snippets2.update_cells_td

function Snippets2__update_95_cells_95_td($_0_arg, $_1_arg, $_2_arg){
    
    if(($_0_arg.type === 2)) {
        return $partial_4_5$Snippets2___123_set_95_cells_95_attr_95_58_125_($_2_arg, $_0_arg.$1, $_1_arg, $_0_arg.$2);
    } else if(($_0_arg.type === 1)) {
        
        $JSRTS.die("*** Snippets2.idr:441:1-443:54:unmatched case in Snippets2.update_cells_td ***");
    } else if(($_0_arg.type === 0)) {
        
        if(($_0_arg.$2.type === 3)) {
            let $cg$3 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
                $cg$3 = $HC_0_0$Prelude__List__Nil;
            } else {
                let $cg$4 = null;
                if((((("%d".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                    $cg$4 = true;
                } else {
                    $cg$4 = false;
                }
                
                let $cg$5 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                    $cg$5 = $HC_0_0$Prelude__Strings__StrNil;
                } else {
                    $cg$5 = new $HC_2_1$Prelude__Strings__StrCons("%d".slice(1)[0], "%d".slice(1).slice(1));
                }
                
                $cg$3 = new $HC_2_1$Prelude__List___58__58_("%d"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$5));
            }
            
            let $cg$6 = null;
            $cg$6 = $_2_arg.$1.subtract($_2_arg.$2);
            return $partial_2_3$JSIO__JSIO__update_95_element_95_text(($_1_arg + ("_" + $_0_arg.$1)), Printf__toFunction(Printf__format($cg$3), "")($cg$6));
        } else {
            $JSRTS.die("*** Snippets2.idr:441:1-443:54:unmatched case in Snippets2.update_cells_td ***");
        }
    } else {
        $JSRTS.die("*** Snippets2.idr:441:1-443:54:unmatched case in Snippets2.update_cells_td ***");
    }
}

// JSIO.JSIO.update_element_text

function JSIO__JSIO__update_95_element_95_text($_0_x, $_1_x1, $_2_w){
    return (update_element_text(($_0_x),($_1_x1)));
}

// Main.whs_ModelDataList

function Main__whs_95_ModelDataList(){
    return new $HC_3_0$DataStore__MkMDList("items", new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a1", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a2", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a3", "\xa3"), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$Builtins__MkPair("a4", "\xa3"), $HC_0_0$Prelude__List__Nil)))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), new $HC_2_1$Prelude__List___58__58_(new $HC_2_0$DataStore__Tt((new $JSRTS.jsbn.BigInteger(("0"))), (new $JSRTS.jsbn.BigInteger(("0")))), $HC_0_0$Prelude__List__Nil)))));
}

// Prelude.List.zipWith

function Prelude__List__zipWith($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg){
    
    if(($_5_arg.type === 1)) {
        
        if(($_4_arg.type === 1)) {
            return new $HC_2_1$Prelude__List___58__58_($_3_arg($_4_arg.$1)($_5_arg.$1), Prelude__List__zipWith(null, null, null, $_3_arg, $_4_arg.$2, $_5_arg.$2));
        } else {
            return $_4_arg;
        }
    } else {
        
        if(($_4_arg.type === 1)) {
            return $HC_0_0$Prelude__List__Nil;
        } else {
            return $_4_arg;
        }
    }
}

// Snippets2.tab_widget.{add_whs_button_0}

function Snippets2__tab_95_widget___123_add_95_whs_95_button_95_0_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1)[0], "\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    const $_11_in = JSIO__JSIO__insert_95_adjancent_95_html(($_0_lift + "__card_footer"), "beforeend", Printf__toFunction(Printf__format($cg$1), "")($_1_lift)("Update Whs"), $_5_lift);
    return JSIO__JSIO__onClick(("#" + $_1_lift), $partial_3_4$Snippets2__tab_95_widget__on_95_table_95_set_95_whs_95_route($_2_lift, $_3_lift, $_4_lift), $_5_lift);
}

// Snippets2.tab_widget.{add_whs_done_button_1}

function Snippets2__tab_95_widget___123_add_95_whs_95_done_95_button_95_1_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1)[0], "\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    const $_11_in = JSIO__JSIO__insert_95_adjancent_95_html(($_0_lift + "__card_footer"), "beforeend", Printf__toFunction(Printf__format($cg$1), "")($_1_lift)("Done & Invoice"), $_4_lift);
    return JSIO__JSIO__onClick(("#" + $_1_lift), $partial_3_4$Snippets2__tab_95_widget__on_95_table_95_whs_95_done(null, $_2_lift, $_3_lift), $_4_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_2}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_2_125_($_0_lift){
    let $cg$1 = null;
    if((((($_0_lift == "")) ? 1|0 : 0|0) === 0)) {
        $cg$1 = true;
    } else {
        $cg$1 = false;
    }
    
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$1, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$3 = null;
        if((((($_0_lift.slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$4 = new $HC_2_1$Prelude__Strings__StrCons($_0_lift.slice(1)[0], $_0_lift.slice(1).slice(1));
        }
        
        $cg$2 = new $HC_2_1$Prelude__List___58__58_($_0_lift[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
    }
    
    return (("\"")+(Prelude__Show__showLitString($cg$2, "\"")));
}

// Snippets2.tab_widget.{calc_order_subtotals_4}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_4_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$1;
    let $cg$3 = null;
    $cg$3 = $_1_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__mulSchema2Vals($cg$1, $cg$2, $cg$3), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_5}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_5_125_($_0_lift, $_1_lift){
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_0_lift, $HC_0_0$Prelude__List__Nil), $_1_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_6}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_($_0_lift, $_1_lift){
    return new $HC_2_0$Builtins__MkPair($_0_lift, $_1_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_7}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_7_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Snippets2__tab_95_widget__convert_95_2sub($cg$1, $cg$2, $_2_lift), $HC_0_0$Prelude__List__Nil), $_3_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_8}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_8_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Snippets2__tab_95_widget__convert_95_2sub($cg$1, $cg$2, $_2_lift), $HC_0_0$Prelude__List__Nil), $_3_lift);
}

// Snippets2.tab_widget.{calc_order_subtotals_9}

function Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_9_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__invSchema2($cg$1, $_1_lift), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{calc_order_t_10}

function Snippets2__tab_95_widget___123_calc_95_order_95_t_95_10_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    const $cg$3 = $_0_lift.$1;
    if(($cg$3.type === 2)) {
        const $cg$5 = $cg$3.$1;
        if(($cg$5.type === 1)) {
            const $cg$7 = $cg$3.$2;
            if(($cg$7.type === 1)) {
                let $cg$8 = null;
                $cg$8 = $_1_lift.$1;
                $cg$1 = Snippets2__convert_95_s3LR_95_drop_95_col__drop_95_col_58_ret_58_0($cg$5.$1, $cg$5.$2, $cg$7.$1, $cg$7.$2, $cg$8, "sku", $_2_lift);
            } else {
                $JSRTS.die("*** Snippets2.idr:80:3-85:39:unmatched case in Snippets2.convert_s3LR_drop_col.drop_col ***");
            }
        } else {
            $JSRTS.die("*** Snippets2.idr:80:3-85:39:unmatched case in Snippets2.convert_s3LR_drop_col.drop_col ***");
        }
    } else {
        $JSRTS.die("*** Snippets2.idr:80:3-85:39:unmatched case in Snippets2.convert_s3LR_drop_col.drop_col ***");
    }
    
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($cg$1, $HC_0_0$Prelude__List__Nil), $_3_lift);
}

// Snippets2.tab_widget.{calc_order_t_11}

function Snippets2__tab_95_widget___123_calc_95_order_95_t_95_11_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__invSchema2($cg$1, $_1_lift), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{calc_order_t_12}

function Snippets2__tab_95_widget___123_calc_95_order_95_t_95_12_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Snippets2__tab_95_widget__convert_95_2sub($cg$1, $cg$2, $_2_lift), $HC_0_0$Prelude__List__Nil), $_3_lift);
}

// Snippets2.tab_widget.{insert_rows2_13}

function Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_($_0_lift, $_1_lift){
    return ($_0_lift + $_1_lift);
}

// Snippets2.tab_widget.{insert_rows2_15}

function Snippets2__tab_95_widget___123_insert_95_rows2_95_15_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift){
    const $_15_in = JSIO__JSIO__key_95_exist($_0_lift, $_5_lift);
    
    if((((($_15_in === 1)) ? 1|0 : 0|0) === 0)) {
        let $cg$2 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$2 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$3 = null;
            if((((("<tr id=%s>%s %s</tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$3 = true;
            } else {
                $cg$3 = false;
            }
            
            let $cg$4 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
                $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$4 = new $HC_2_1$Prelude__Strings__StrCons("<tr id=%s>%s %s</tr>".slice(1)[0], "<tr id=%s>%s %s</tr>".slice(1).slice(1));
            }
            
            $cg$2 = new $HC_2_1$Prelude__List___58__58_("<tr id=%s>%s %s</tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
        }
        
        let $cg$5 = null;
        $cg$5 = $_2_lift.$1;
        let $cg$6 = null;
        $cg$6 = $_2_lift.$2;
        return JSIO__JSIO__insert_95_adjancent_95_html($_1_lift, "beforeend", Printf__toFunction(Printf__format($cg$2), "")($_0_lift)(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Snippets2__render_95_with_95_ids__renderDataWithSchema2($cg$5, $_0_lift, $_3_lift)))(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Snippets2__render_95_with_95_ids__renderDataWithSchema2($cg$6, $_0_lift, $_4_lift))), $_5_lift);
    } else {
        let $cg$7 = null;
        $cg$7 = $_2_lift.$2;
        return Snippets2__tab_95_widget__update_95_cells_95_ke1($_0_lift, $cg$7, $_4_lift, $_5_lift);
    }
}

// Snippets2.tab_widget.{insert_rows2_16}

function Snippets2__tab_95_widget___123_insert_95_rows2_95_16_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $_5_in = null;
    $_5_in = $_2_lift.$1;
    let $_8_in = null;
    $_8_in = $_2_lift.$2;
    let $cg$3 = null;
    $cg$3 = $_1_lift.$1;
    const $_11_in = ($_0_lift + ("_row" + Snippets2__renderDataAsKey($cg$3, $_5_in)));
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($partial_5_6$Snippets2__tab_95_widget___123_insert_95_rows2_95_15_125_($_11_in, $_0_lift, $_1_lift, $_5_in, $_8_in), $HC_0_0$Prelude__List__Nil), $_3_lift);
}

// Snippets2.tab_widget.{insert_table_18}

function Snippets2__tab_95_widget___123_insert_95_table_95_18_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n            <!-- Content Edit Table -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody %s>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"card_footer\" %s>\n            <div/>\n              \n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n            <!-- Content Edit Table -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody %s>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"card_footer\" %s>\n            <div/>\n              \n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1)[0], "\n            <!-- Content Edit Table -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody %s>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"card_footer\" %s>\n            <div/>\n              \n            </div>\n          </div>  <!-- /.card -->\n            ".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n            <!-- Content Edit Table -->\n            <div class=\"card border-dark  mt-3\">\n              <div class=\"card-header\">\n              <h4>%s</h4>\n              </div>\n            <div class=\"card-body\">\n              <table class=\"customers\">\n                <thead>\n                    %s\n                </thead>\n                <tbody %s>\n                </tbody>\n              </table>\n            </div>\n\n            <div class=\"card_footer\" %s>\n            <div/>\n              \n            </div>\n          </div>  <!-- /.card -->\n            "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    let $cg$4 = null;
    $cg$4 = $_1_lift.$1;
    let $cg$5 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$5 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$6 = null;
        if((((("<tr>%s %s</tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$6 = true;
        } else {
            $cg$6 = false;
        }
        
        let $cg$7 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$6, true).type === 1)) {
            $cg$7 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$7 = new $HC_2_1$Prelude__Strings__StrCons("<tr>%s %s</tr>".slice(1)[0], "<tr>%s %s</tr>".slice(1).slice(1));
        }
        
        $cg$5 = new $HC_2_1$Prelude__List___58__58_("<tr>%s %s</tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$7));
    }
    
    let $cg$8 = null;
    $cg$8 = $_2_lift.$1;
    let $cg$9 = null;
    $cg$9 = $_2_lift.$2;
    let $cg$10 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$10 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$11 = null;
        if(((((" id=\"%s\" ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$11 = true;
        } else {
            $cg$11 = false;
        }
        
        let $cg$12 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$11, true).type === 1)) {
            $cg$12 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$12 = new $HC_2_1$Prelude__Strings__StrCons(" id=\"%s\" ".slice(1)[0], " id=\"%s\" ".slice(1).slice(1));
        }
        
        $cg$10 = new $HC_2_1$Prelude__List___58__58_(" id=\"%s\" "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$12));
    }
    
    const $_19_in = JSIO__JSIO__insert_95_adjancent_95_html($_0_lift, "beforeend", Printf__toFunction(Printf__format($cg$1), "")($cg$4)(Printf__toFunction(Printf__format($cg$5), "")(Snippets2__schema2thead2_58_ret_58_0($cg$8))(Snippets2__schema2thead2_58_ret_58_0($cg$9)))(Printf__toFunction(Printf__format($cg$10), "")($_3_lift))($_4_lift), $_5_lift);
    return Snippets2__tab_95_widget__insert_95_rows2($_3_lift, $_2_lift, $_1_lift)($_5_lift);
}

// Snippets2.{make_cells_ro_19}

function Snippets2___123_make_95_cells_95_ro_95_19_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    const $_5_in = Snippets2__make_95_cells_95_ro($_0_lift, $_1_lift)($_3_lift);
    return Snippets2__make_95_cells_95_ro($_0_lift, $_2_lift)($_3_lift);
}

// Snippets2.{make_cells_ro_20}

function Snippets2___123_make_95_cells_95_ro_95_20_125_($_0_lift){
    return $HC_0_0$MkUnit;
}

// Snippets2.{make_cells_ro_21}

function Snippets2___123_make_95_cells_95_ro_95_21_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    
    if(($_0_lift.type === 3)) {
        const $_17_in = JSIO__JSIO__get_95_qty_95_int_95_value2((($_1_lift + ("_" + $_2_lift)) + "_input_tag"), $_3_lift);
        return JSIO__JSIO__update_95_element_95_text(($_1_lift + ("_" + $_2_lift)), (''+($_17_in)), $_3_lift);
    } else {
        return $HC_0_0$MkUnit;
    }
}

// JSIO.JSIO.{onClick_22}

function JSIO__JSIO___123_onClick_95_22_125_($_0_lift, $_1_lift){
    return $_0_lift;
}

// Snippets2.tab_widget.{on_set_backorders_23}

function Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_23_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__invSchema2($cg$1, $_1_lift), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_set_backorders_24}

function Snippets2__tab_95_widget___123_on_95_set_95_backorders_95_24_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__invSchema2($cg$1, $_1_lift), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_table_commit_25}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_25_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Snippets2__make_95_cells_95_ro($_1_lift, $cg$1), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_table_commit_26}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_26_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    let $cg$3 = null;
    $cg$3 = $_1_lift.$1;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Snippets2__set_95_cells_95_attr($cg$1, $cg$2, $cg$3), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_table_commit_28}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_28_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    let $cg$2 = null;
    $cg$2 = $_0_lift.$2;
    let $cg$3 = null;
    $cg$3 = $_0_lift.$2;
    $cg$1 = new $HC_2_1$Prelude__List___58__58_(DataStore__addSchema2Vals($cg$2, $_1_lift.$1, DataStore__invSchema2($cg$3, $_1_lift.$2)), $HC_0_0$Prelude__List__Nil);
    return Prelude__List___43__43_(null, $cg$1, $_2_lift);
}

// Snippets2.tab_widget.{on_table_commit_32}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_32_125_($_0_lift, $_1_lift, $_2_lift){
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($_0_lift, $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_table_commit_33}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_33_125_($_0_lift, $_1_lift){
    return new $HC_2_1$Prelude__List___58__58_($_1_lift, $HC_0_0$Prelude__List__Nil);
}

// Snippets2.tab_widget.{on_table_commit_34}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_34_125_($_0_lift){
    return $HC_0_0$Prelude__List__Nil;
}

// Snippets2.tab_widget.{on_table_commit_35}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_35_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    let $cg$2 = null;
    $cg$2 = $_2_lift.$2;
    return Prelude__List___43__43_(null, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_32_125_($_2_lift), $HC_0_0$Prelude__List__Nil, Prelude__Applicative__guard(null, new $HC_2_0$Prelude__Applicative__Alternative_95_ictor($partial_0_2$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_33_125_(), $partial_0_1$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_34_125_()), (!(!(!DataStore__eqSchema2($cg$1, $cg$2, $_1_lift)))))), $_3_lift);
}

// Snippets2.tab_widget.{on_table_commit_36}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_36_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift){
    let $_119_in = null;
    if((Prelude__Interfaces__Prelude__Nat___64_Prelude__Interfaces__Ord_36_Nat_58__33_compare_58_0(Prelude__List__length(null, $_0_lift), (new $JSRTS.jsbn.BigInteger(("0")))) > 0)) {
        let $cg$2 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$2 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$3 = null;
            if((((("Amendment:%s".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$3 = true;
            } else {
                $cg$3 = false;
            }
            
            let $cg$4 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
                $cg$4 = $HC_0_0$Prelude__List__Nil;
            } else {
                let $cg$5 = null;
                if((((("Amendment:%s".slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                    $cg$5 = true;
                } else {
                    $cg$5 = false;
                }
                
                let $cg$6 = null;
                if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
                    $cg$6 = $HC_0_0$Prelude__List__Nil;
                } else {
                    let $cg$7 = null;
                    if((((("Amendment:%s".slice(1).slice(1).slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                        $cg$7 = true;
                    } else {
                        $cg$7 = false;
                    }
                    
                    let $cg$8 = null;
                    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$7, true).type === 1)) {
                        $cg$8 = $HC_0_0$Prelude__Strings__StrNil;
                    } else {
                        $cg$8 = new $HC_2_1$Prelude__Strings__StrCons("Amendment:%s".slice(1).slice(1).slice(1)[0], "Amendment:%s".slice(1).slice(1).slice(1).slice(1));
                    }
                    
                    $cg$6 = new $HC_2_1$Prelude__List___58__58_("Amendment:%s".slice(1).slice(1)[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$8));
                }
                
                $cg$4 = new $HC_2_1$Prelude__List___58__58_("Amendment:%s".slice(1)[0], $cg$6);
            }
            
            $cg$2 = new $HC_2_1$Prelude__List___58__58_("Amendment:%s"[0], $cg$4);
        }
        
        let $cg$9 = null;
        $cg$9 = $_3_lift.$1;
        $_119_in = Snippets2__tab_95_widget__table_95_amendments(Printf__toFunction(Printf__format($cg$2), "")($_1_lift), "amendments", $_2_lift, new $HC_3_0$DataStore__MkMDList($cg$9, $_4_lift, $_0_lift))($_5_lift);
    } else {
        $_119_in = $HC_0_0$MkUnit;
    }
    
    return Snippets2__tab_95_widget__calc_95_order_95_subtotals("order1", "subtotal", "order_total", new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("qty", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("price", $HC_0_3$DataStore__FTterm)), new $HC_2_0$DataStore__MkModelSchema(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField("sku", new $HC_1_3$DataStore__NSCode("asset")), new $HC_2_1$DataStore__EField("cy", new $HC_1_3$DataStore__NSCode("asset"))), new $HC_2_0$DataStore__IField("subtotal", $HC_0_3$DataStore__FTterm)), $_5_lift);
}

// Snippets2.tab_widget.{on_table_commit_37}

function Snippets2__tab_95_widget___123_on_95_table_95_commit_95_37_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift){
    const $_9_in = JSIO__JSIO__toggle_95_hide_95_show_95_element(($_0_lift + "__edit_button"), $_5_lift);
    const $_10_in = JSIO__JSIO__toggle_95_hide_95_show_95_element(($_0_lift + "__commit_button"), $_5_lift);
    const $_11_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids($_1_lift, $HC_0_0$Prelude__List__Nil, $_5_lift);
    const $_16_in = Snippets2__runjsio(null, $HC_0_0$MkUnit, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_25_125_($_2_lift), $HC_0_0$Prelude__List__Nil, $_11_in), $_5_lift);
    let $cg$1 = null;
    $cg$1 = $_2_lift.$1;
    const $_19_in = Snippets2__read_95_cells_95_row($_11_in, $cg$1, $_5_lift);
    let $cg$2 = null;
    $cg$2 = $_2_lift.$2;
    const $_22_in = Snippets2__read_95_cells_95_row($_11_in, $cg$2, $_5_lift);
    let $cg$3 = null;
    $cg$3 = $_2_lift.$2;
    const $_25_in = Snippets2__read_95_cells_95_attr_95_row($_11_in, $cg$3, $_5_lift);
    let $cg$4 = null;
    $cg$4 = $_2_lift.$2;
    const $_26_in = DataStore__schema2ZeroVal($cg$4);
    const $_29_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_26_125_($_2_lift), $HC_0_0$Prelude__List__Nil, Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), $_22_in, $_11_in));
    const $_40_in = Snippets2__runjsio(null, $HC_0_0$MkUnit, $_29_in, $_5_lift);
    const $_41_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_28_125_($_2_lift), $HC_0_0$Prelude__List__Nil, Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), $_22_in, $_25_in));
    const $_52_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_5_125_(), $HC_0_0$Prelude__List__Nil, Prelude__List__zipWith(null, null, null, $partial_0_2$Snippets2__tab_95_widget___123_calc_95_order_95_subtotals_95_6_125_(), $_11_in, $_41_in));
    const $_57_in = Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_2_4$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_35_125_($_2_lift, $_26_in), $HC_0_0$Prelude__List__Nil, $_52_in);
    const $cg$6 = Prelude__List__unzip(null, null, $_57_in);
    let $cg$7 = null;
    $cg$7 = $_2_lift.$1;
    return io_95_bind(null, null, null, $partial_2_3$Snippets2__read_95_cells_95_row($cg$6.$1, $cg$7), $partial_4_6$Snippets2__tab_95_widget___123_on_95_table_95_commit_95_36_125_($cg$6.$2, $_3_lift, $_2_lift, $_4_lift), $_5_lift);
}

// Snippets2.tab_widget.{on_table_edit_38}

function Snippets2__tab_95_widget___123_on_95_table_95_edit_95_38_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_($partial_2_3$Snippets2__make_95_cells_95_editable($_1_lift, $cg$1), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{on_table_edit_39}

function Snippets2__tab_95_widget___123_on_95_table_95_edit_95_39_125_($_0_lift, $_1_lift, $_2_lift){
    const $_8_in = Snippets2__tab_95_widget__get_95_table_95_row_95_ids(($_0_lift + "__table"), $HC_0_0$Prelude__List__Nil, $_2_lift);
    const $_13_in = Snippets2__runjsio(null, $HC_0_0$MkUnit, Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_1_3$Snippets2__tab_95_widget___123_on_95_table_95_edit_95_38_125_($_1_lift), $HC_0_0$Prelude__List__Nil, $_8_in), $_2_lift);
    const $_14_in = JSIO__JSIO__toggle_95_hide_95_show_95_element(($_0_lift + "__edit_button"), $_2_lift);
    return JSIO__JSIO__toggle_95_hide_95_show_95_element(($_0_lift + "__commit_button"), $_2_lift);
}

// Snippets2.tab_widget.{on_table_set_whs_route_40}

function Snippets2__tab_95_widget___123_on_95_table_95_set_95_whs_95_route_95_40_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(DataStore__invSchema2($cg$1, $_1_lift), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.{read_cells_41}

function Snippets2___123_read_95_cells_95_41_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift){
    const $_5_in = Snippets2__read_95_cells($_0_lift, $_1_lift)($_3_lift);
    const $_6_in = Snippets2__read_95_cells($_0_lift, $_2_lift)($_3_lift);
    return new $HC_2_0$Builtins__MkPair($_5_in, $_6_in);
}

// Snippets2.{read_cells_42}

function Snippets2___123_read_95_cells_95_42_125_($_0_lift, $_1_lift, $_2_lift){
    const $_11_in = JSIO__JSIO__get_95_element_95_text(($_0_lift + ("_" + $_1_lift)), $_2_lift);
    return $_11_in;
}

// Snippets2.{read_cells_50}

function Snippets2___123_read_95_cells_95_50_125_($_0_lift, $_1_lift, $_2_lift){
    const $_32_in = JSIO__JSIO__get_95_qty_95_int(($_0_lift + ("_" + $_1_lift)), $_2_lift);
    return DataStore__integer2t((new $JSRTS.jsbn.BigInteger(''+($_32_in))));
}

// Snippets2.tab_widget.{render_rows_wo_ids_52}

function Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_52_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$1;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Snippets2__render_95_wo_95_ids__renderDataWithSchema2($cg$1, $_1_lift)), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{render_rows_wo_ids_54}

function Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_54_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_0_lift.$2;
    return Prelude__List___43__43_(null, new $HC_2_1$Prelude__List___58__58_(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Snippets2__render_95_wo_95_ids__renderDataWithSchema2($cg$1, $_1_lift)), $HC_0_0$Prelude__List__Nil), $_2_lift);
}

// Snippets2.tab_widget.{render_rows_wo_ids_57}

function Snippets2__tab_95_widget___123_render_95_rows_95_wo_95_ids_95_57_125_($_0_lift, $_1_lift){
    let $cg$1 = null;
    let $cg$2 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$2 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$3 = null;
        if((((("<tr> %s %s </tr>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$3 = true;
        } else {
            $cg$3 = false;
        }
        
        let $cg$4 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$3, true).type === 1)) {
            $cg$4 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$4 = new $HC_2_1$Prelude__Strings__StrCons("<tr> %s %s </tr>".slice(1)[0], "<tr> %s %s </tr>".slice(1).slice(1));
        }
        
        $cg$2 = new $HC_2_1$Prelude__List___58__58_("<tr> %s %s </tr>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$4));
    }
    
    $cg$1 = new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$2), "")($_0_lift.$1)($_0_lift.$2), $HC_0_0$Prelude__List__Nil);
    return Prelude__List___43__43_(null, $cg$1, $_1_lift);
}

// Snippets2.{set_cells_attr_58}

function Snippets2___123_set_95_cells_95_attr_95_58_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift){
    
    const $_9_in = Snippets2__set_95_cells_95_attr($_1_lift, $_2_lift, $_0_lift.$1)($_4_lift);
    return Snippets2__set_95_cells_95_attr($_3_lift, $_2_lift, $_0_lift.$2)($_4_lift);
}

// Snippets2.{set_cells_attr_60}

function Snippets2___123_set_95_cells_95_attr_95_60_125_($_0_lift, $_1_lift, $_2_lift){
    let $cg$1 = null;
    $cg$1 = $_1_lift.$1;
    const $_29_in = JSIO__JSIO__set_95_qty_95_int_95_datadr($_0_lift, (($cg$1).intValue()|0), $_2_lift);
    let $cg$2 = null;
    $cg$2 = $_1_lift.$2;
    return JSIO__JSIO__set_95_qty_95_int_95_datacr($_0_lift, (($cg$2).intValue()|0), $_2_lift);
}

// Prelude.Show.{showLitChar_61}

function Prelude__Show___123_showLitChar_95_61_125_($_0_lift){
    return ("\\a" + $_0_lift);
}

// Prelude.Show.{showLitChar_62}

function Prelude__Show___123_showLitChar_95_62_125_($_0_lift){
    return ("\\b" + $_0_lift);
}

// Prelude.Show.{showLitChar_63}

function Prelude__Show___123_showLitChar_95_63_125_($_0_lift){
    return ("\\t" + $_0_lift);
}

// Prelude.Show.{showLitChar_64}

function Prelude__Show___123_showLitChar_95_64_125_($_0_lift){
    return ("\\n" + $_0_lift);
}

// Prelude.Show.{showLitChar_65}

function Prelude__Show___123_showLitChar_95_65_125_($_0_lift){
    return ("\\v" + $_0_lift);
}

// Prelude.Show.{showLitChar_66}

function Prelude__Show___123_showLitChar_95_66_125_($_0_lift){
    return ("\\f" + $_0_lift);
}

// Prelude.Show.{showLitChar_67}

function Prelude__Show___123_showLitChar_95_67_125_($_0_lift){
    return ("\\r" + $_0_lift);
}

// Prelude.Show.{showLitChar_68}

function Prelude__Show___123_showLitChar_95_68_125_($_0_lift){
    return ($_0_lift === "H");
}

// Prelude.Show.{showLitChar_69}

function Prelude__Show___123_showLitChar_95_69_125_($_0_lift){
    return ("\\\\" + $_0_lift);
}

// Prelude.Show.{showLitChar_70}

function Prelude__Show___123_showLitChar_95_70_125_($_0_lift){
    return ("\\DEL" + $_0_lift);
}

// Prelude.Show.{showLitChar_71}

function Prelude__Show___123_showLitChar_95_71_125_($_0_lift, $_1_lift){
    return prim_95__95_strCons("\\", ($_0_lift + $_1_lift));
}

// Prelude.Show.{showLitChar_72}

function Prelude__Show___123_showLitChar_95_72_125_($_0_lift, $_1_lift){
    return prim_95__95_strCons("\\", Prelude__Show__protectEsc($partial_0_1$Prelude__Chars__isDigit(), Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrInt(), $HC_0_0$Prelude__Show__Open, (($_0_lift).charCodeAt(0)|0)), $_1_lift));
}

// Snippets2.tab_widget.{table_amendments_73}

function Snippets2__tab_95_widget___123_table_95_amendments_95_73_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift){
    const $_6_in = Snippets2__tab_95_widget__insert_95_table_95_wo_95_ids($_0_lift, $_1_lift, $_2_lift)($_4_lift);
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("<h4>%s</h4>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("<h4>%s</h4>".slice(1)[0], "<h4>%s</h4>".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("<h4>%s</h4>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    return JSIO__JSIO__insert_95_adjancent_95_html($_0_lift, "afterbegin", Printf__toFunction(Printf__format($cg$1), "")($_3_lift), $_4_lift);
}

// Snippets2.tab_widget.{table_composite_74}

function Snippets2__tab_95_widget___123_table_95_composite_95_74_125_($_0_lift, $_1_lift, $_2_lift, $_3_lift, $_4_lift, $_5_lift, $_6_lift){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("\n          <div id=\"%s\" class=\"sticky-top\">\n\t  </div>   \n   ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("\n          <div id=\"%s\" class=\"sticky-top\">\n\t  </div>   \n   ".slice(1)[0], "\n          <div id=\"%s\" class=\"sticky-top\">\n\t  </div>   \n   ".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("\n          <div id=\"%s\" class=\"sticky-top\">\n\t  </div>   \n   "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    const $_12_in = JSIO__JSIO__insert_95_adjancent_95_html($_0_lift, "beforeend", Printf__toFunction(Printf__format($cg$1), "")($_1_lift), $_6_lift);
    let $cg$4 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$4 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$5 = null;
        if((((("<h4>%s</h4>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$5 = true;
        } else {
            $cg$5 = false;
        }
        
        let $cg$6 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$5, true).type === 1)) {
            $cg$6 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$6 = new $HC_2_1$Prelude__Strings__StrCons("<h4>%s</h4>".slice(1)[0], "<h4>%s</h4>".slice(1).slice(1));
        }
        
        $cg$4 = new $HC_2_1$Prelude__List___58__58_("<h4>%s</h4>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$6));
    }
    
    const $_15_in = JSIO__JSIO__insert_95_adjancent_95_html($_1_lift, "beforeend", Printf__toFunction(Printf__format($cg$4), "")($_2_lift), $_6_lift);
    const $_16_in = ($_1_lift + "__edit_button");
    const $_17_in = ($_1_lift + "__commit_button");
    const $_18_in = ($_1_lift + "__card_footer");
    let $cg$7 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$7 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$8 = null;
        if(((((" id=\"%s\" ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$8 = true;
        } else {
            $cg$8 = false;
        }
        
        let $cg$9 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$8, true).type === 1)) {
            $cg$9 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$9 = new $HC_2_1$Prelude__Strings__StrCons(" id=\"%s\" ".slice(1)[0], " id=\"%s\" ".slice(1).slice(1));
        }
        
        $cg$7 = new $HC_2_1$Prelude__List___58__58_(" id=\"%s\" "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$9));
    }
    
    const $_21_in = Snippets2__tab_95_widget__insert_95_table($_1_lift, Printf__toFunction(Printf__format($cg$7), "")($_18_in), $_3_lift, $_4_lift)($_6_lift);
    
    if($_5_lift) {
        let $cg$11 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$11 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$12 = null;
            if((((("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$12 = true;
            } else {
                $cg$12 = false;
            }
            
            let $cg$13 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$12, true).type === 1)) {
                $cg$13 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$13 = new $HC_2_1$Prelude__Strings__StrCons("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1)[0], "\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1).slice(1));
            }
            
            $cg$11 = new $HC_2_1$Prelude__List___58__58_("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$13));
        }
        
        const $_24_in = JSIO__JSIO__insert_95_adjancent_95_html($_18_in, "beforeend", Printf__toFunction(Printf__format($cg$11), "")($_16_in)("Edit"), $_6_lift);
        let $cg$14 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$14 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$15 = null;
            if((((("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$15 = true;
            } else {
                $cg$15 = false;
            }
            
            let $cg$16 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$15, true).type === 1)) {
                $cg$16 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$16 = new $HC_2_1$Prelude__Strings__StrCons("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1)[0], "\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         ".slice(1).slice(1));
            }
            
            $cg$14 = new $HC_2_1$Prelude__List___58__58_("\n             <button class=\"btn btn-primary\" id=\"%s\">%s</button>\n         "[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$16));
        }
        
        const $_27_in = JSIO__JSIO__insert_95_adjancent_95_html($_18_in, "beforeend", Printf__toFunction(Printf__format($cg$14), "")($_17_in)("Commit"), $_6_lift);
        const $_28_in = JSIO__JSIO__onClick(("#" + $_16_in), Snippets2__tab_95_widget__on_95_table_95_edit($_0_lift, $_3_lift, $_4_lift), $_6_lift);
        const $_29_in = JSIO__JSIO__onClick(("#" + $_17_in), Snippets2__tab_95_widget__on_95_table_95_commit($_0_lift, $_3_lift, $_4_lift), $_6_lift);
        return JSIO__JSIO__toggle_95_hide_95_show_95_element($_17_in, $_6_lift);
    } else {
        return $HC_0_0$MkUnit;
    }
}

// Printf.{toFunction_75}

function Printf___123_toFunction_95_75_125_($_0_lift, $_1_lift, $_2_lift){
    return Printf__toFunction($_0_lift, ($_1_lift + Prelude__Show__primNumShow(null, $partial_0_1$prim_95__95_toStrBigInt(), $HC_0_0$Prelude__Show__Open, $_2_lift)));
}

// Printf.{toFunction_76}

function Printf___123_toFunction_95_76_125_($_0_lift, $_1_lift, $_2_lift){
    return Printf__toFunction($_0_lift, ($_1_lift + $_2_lift));
}

// Decidable.Equality.Decidable.Equality.Bool implementation of Decidable.Equality.DecEq, method decEq

function Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($_0_arg, $_1_arg){
    
    if($_1_arg) {
        
        if($_0_arg) {
            return $HC_0_0$Prelude__Basics__Yes;
        } else {
            return $HC_0_1$Prelude__Basics__No;
        }
    } else {
        
        if($_0_arg) {
            return $HC_0_1$Prelude__Basics__No;
        } else {
            return $HC_0_0$Prelude__Basics__Yes;
        }
    }
}

// Prelude.Foldable.Prelude.List.List implementation of Prelude.Foldable.Foldable, method foldr

function Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    
    if(($_4_arg.type === 1)) {
        return $_2_arg($_4_arg.$1)(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $_2_arg, $_3_arg, $_4_arg.$2));
    } else {
        return $_3_arg;
    }
}

// Prelude.Interfaces.Prelude.Interfaces.Char implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Char_58__33_compare_58_0($_0_arg, $_1_arg){
    
    if((((($_0_arg === $_1_arg)) ? 1|0 : 0|0) === 0)) {
        
        if((((($_0_arg < $_1_arg)) ? 1|0 : 0|0) === 0)) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

// Prelude.Interfaces.Prelude.Interfaces.Integer implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Interfaces___64_Prelude__Interfaces__Ord_36_Integer_58__33_compare_58_0($_0_arg, $_1_arg){
    
    if(((($_0_arg.equals($_1_arg)) ? 1|0 : 0|0) === 0)) {
        
        if(((((($_0_arg).compareTo(($_1_arg)) < 0)) ? 1|0 : 0|0) === 0)) {
            return 1;
        } else {
            return -1;
        }
    } else {
        return 0;
    }
}

// Prelude.Interfaces.Prelude.Nat.Nat implementation of Prelude.Interfaces.Ord, method compare

function Prelude__Interfaces__Prelude__Nat___64_Prelude__Interfaces__Ord_36_Nat_58__33_compare_58_0($_0_arg, $_1_arg){
    for(;;) {
        
        if($_1_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
            
            if($_0_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return 0;
            } else {
                const $_2_in = $_0_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                return 1;
            }
        } else {
            const $_3_in = $_1_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
            
            if($_0_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return -1;
            } else {
                const $_4_in = $_0_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                $_0_arg = $_4_in;
                $_1_arg = $_3_in;
            }
        }
    }
}

// {runMain_0}

function $_0_runMain(){
    return $JSRTS.force(Main__main($HC_0_0$TheWorld));
}

// Snippets2.convert_s3LR_drop_col.drop_col, ret

function Snippets2__convert_95_s3LR_95_drop_95_col__drop_95_col_58_ret_58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg, $_5_arg, $_6_arg){
    
    if((((($_5_arg == $_0_arg)) ? 1|0 : 0|0) === 0)) {
        
        if((((($_5_arg == $_2_arg)) ? 1|0 : 0|0) === 0)) {
            return Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_s3(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField($_0_arg, $_1_arg), new $HC_2_1$DataStore__EField($_2_arg, $_3_arg)), $_4_arg, $_6_arg);
        } else {
            return Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_sR(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField($_0_arg, $_1_arg), new $HC_2_1$DataStore__EField($_2_arg, $_3_arg)), $_4_arg, $_6_arg);
        }
    } else {
        return Snippets2__convert_95_s3LR_95_drop_95_col__convert_95_sL(new $HC_2_2$DataStore_____42___(new $HC_2_1$DataStore__EField($_0_arg, $_1_arg), new $HC_2_1$DataStore__EField($_2_arg, $_3_arg)), $_4_arg, $_6_arg);
    }
}

// Snippets2.schema2thead2, ret

function Snippets2__schema2thead2_58_ret_58_0($_0_arg){
    let $cg$1 = null;
    if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
        $cg$1 = $HC_0_0$Prelude__List__Nil;
    } else {
        let $cg$2 = null;
        if((((("%s".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons("%s".slice(1)[0], "%s".slice(1).slice(1));
        }
        
        $cg$1 = new $HC_2_1$Prelude__List___58__58_("%s"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    }
    
    return Printf__toFunction(Printf__format($cg$1), "")(Prelude__Foldable__Prelude__List___64_Prelude__Foldable__Foldable_36_List_58__33_foldr_58_0(null, null, $partial_0_2$Snippets2__tab_95_widget___123_insert_95_rows2_95_13_125_(), "", Snippets2__schema2thead2_58_schema2th_58_0(null, $_0_arg)));
}

// Snippets2.schema2thead2, schema2th

function Snippets2__schema2thead2_58_schema2th_58_0($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 2)) {
        return Prelude__List___43__43_(null, Snippets2__schema2thead2_58_schema2th_58_0(null, $_1_arg.$1), Snippets2__schema2thead2_58_schema2th_58_0(null, $_1_arg.$2));
    } else if(($_1_arg.type === 1)) {
        const $cg$7 = $_1_arg.$2;
        let $cg$8 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$8 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$9 = null;
            if((((("<th>%s[%s]</th>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$9 = true;
            } else {
                $cg$9 = false;
            }
            
            let $cg$10 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$9, true).type === 1)) {
                $cg$10 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$10 = new $HC_2_1$Prelude__Strings__StrCons("<th>%s[%s]</th>".slice(1)[0], "<th>%s[%s]</th>".slice(1).slice(1));
            }
            
            $cg$8 = new $HC_2_1$Prelude__List___58__58_("<th>%s[%s]</th>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$10));
        }
        
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$8), "")($_1_arg.$1)($cg$7.$1), $HC_0_0$Prelude__List__Nil);
    } else {
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0(true, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__List__Nil;
        } else {
            let $cg$4 = null;
            if((((("<th>%s</th>".slice(1) == "")) ? 1|0 : 0|0) === 0)) {
                $cg$4 = true;
            } else {
                $cg$4 = false;
            }
            
            let $cg$5 = null;
            if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$4, true).type === 1)) {
                $cg$5 = $HC_0_0$Prelude__Strings__StrNil;
            } else {
                $cg$5 = new $HC_2_1$Prelude__Strings__StrCons("<th>%s</th>".slice(1)[0], "<th>%s</th>".slice(1).slice(1));
            }
            
            $cg$3 = new $HC_2_1$Prelude__List___58__58_("<th>%s</th>"[0], _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$5));
        }
        
        return new $HC_2_1$Prelude__List___58__58_(Printf__toFunction(Printf__format($cg$3), "")($_1_arg.$1), $HC_0_0$Prelude__List__Nil);
    }
}

// Prelude.Show.Prelude.Show.List a implementation of Prelude.Show.Show, method show, show'

function Prelude__Show__Prelude__Show___64_Prelude__Show__Show_36_List_32_a_58__33_show_58_0_58_show_39__58_0($_0_arg, $_1_arg, $_2_arg, $_3_arg, $_4_arg){
    let $tco$$_3_arg = $_3_arg;
    for(;;) {
        
        if(($_4_arg.type === 1)) {
            
            if(($_4_arg.$2.type === 0)) {
                return ($_3_arg + $_2_arg($_4_arg.$1));
            } else {
                $tco$$_3_arg = ($_3_arg + ($_2_arg($_4_arg.$1) + ", "));
                $_0_arg = null;
                $_1_arg = null;
                $_2_arg = $_2_arg;
                $_3_arg = $tco$$_3_arg;
                $_4_arg = $_4_arg.$2;
            }
        } else {
            return $_3_arg;
        }
    }
}

// Prelude.Show.showLitChar, asciiTab

function Prelude__Show__showLitChar_58_asciiTab_58_10($_0_arg){
    return new $HC_2_1$Prelude__List___58__58_("NUL", new $HC_2_1$Prelude__List___58__58_("SOH", new $HC_2_1$Prelude__List___58__58_("STX", new $HC_2_1$Prelude__List___58__58_("ETX", new $HC_2_1$Prelude__List___58__58_("EOT", new $HC_2_1$Prelude__List___58__58_("ENQ", new $HC_2_1$Prelude__List___58__58_("ACK", new $HC_2_1$Prelude__List___58__58_("BEL", new $HC_2_1$Prelude__List___58__58_("BS", new $HC_2_1$Prelude__List___58__58_("HT", new $HC_2_1$Prelude__List___58__58_("LF", new $HC_2_1$Prelude__List___58__58_("VT", new $HC_2_1$Prelude__List___58__58_("FF", new $HC_2_1$Prelude__List___58__58_("CR", new $HC_2_1$Prelude__List___58__58_("SO", new $HC_2_1$Prelude__List___58__58_("SI", new $HC_2_1$Prelude__List___58__58_("DLE", new $HC_2_1$Prelude__List___58__58_("DC1", new $HC_2_1$Prelude__List___58__58_("DC2", new $HC_2_1$Prelude__List___58__58_("DC3", new $HC_2_1$Prelude__List___58__58_("DC4", new $HC_2_1$Prelude__List___58__58_("NAK", new $HC_2_1$Prelude__List___58__58_("SYN", new $HC_2_1$Prelude__List___58__58_("ETB", new $HC_2_1$Prelude__List___58__58_("CAN", new $HC_2_1$Prelude__List___58__58_("EM", new $HC_2_1$Prelude__List___58__58_("SUB", new $HC_2_1$Prelude__List___58__58_("ESC", new $HC_2_1$Prelude__List___58__58_("FS", new $HC_2_1$Prelude__List___58__58_("GS", new $HC_2_1$Prelude__List___58__58_("RS", new $HC_2_1$Prelude__List___58__58_("US", $HC_0_0$Prelude__List__Nil))))))))))))))))))))))))))))))));
}

// Prelude.Show.showLitChar, getAt

function Prelude__Show__showLitChar_58_getAt_58_10($_0_arg, $_1_arg, $_2_arg){
    for(;;) {
        
        if(($_2_arg.type === 1)) {
            
            if($_1_arg.equals((new $JSRTS.jsbn.BigInteger(("0"))))) {
                return new $HC_1_1$Prelude__Maybe__Just($_2_arg.$1);
            } else {
                const $_5_in = $_1_arg.subtract((new $JSRTS.jsbn.BigInteger(("1"))));
                $_0_arg = null;
                $_1_arg = $_5_in;
                $_2_arg = $_2_arg.$2;
            }
        } else {
            return $HC_0_0$Prelude__Maybe__Nothing;
        }
    }
}

// with block in Prelude.Strings.unpack

function _95_Prelude__Strings__unpack_95_with_95_36($_0_arg, $_1_arg){
    
    if(($_1_arg.type === 1)) {
        let $cg$2 = null;
        if((((($_1_arg.$2 == "")) ? 1|0 : 0|0) === 0)) {
            $cg$2 = true;
        } else {
            $cg$2 = false;
        }
        
        let $cg$3 = null;
        if((Decidable__Equality__Decidable__Equality___64_Decidable__Equality__DecEq_36_Bool_58__33_decEq_58_0($cg$2, true).type === 1)) {
            $cg$3 = $HC_0_0$Prelude__Strings__StrNil;
        } else {
            $cg$3 = new $HC_2_1$Prelude__Strings__StrCons($_1_arg.$2[0], $_1_arg.$2.slice(1));
        }
        
        return new $HC_2_1$Prelude__List___58__58_($_1_arg.$1, _95_Prelude__Strings__unpack_95_with_95_36(null, $cg$3));
    } else {
        return $HC_0_0$Prelude__List__Nil;
    }
}


$_0_runMain();
}.call(this))